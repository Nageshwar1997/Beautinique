import {
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconDanger,
  IconSearch,
} from '@beautinique/frontend-icons';
import {
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button as AriaButton,
  Collection,
  Dialog as AriaDialog,
  DialogTrigger,
  Input as AriaInput,
  type Key,
  Popover,
  SearchField,
  type Selection,
  Tree,
  TreeItem,
  TreeItemContent,
} from 'react-aria-components';

import { Button } from './button';
import { cx } from './cx';
import {
  branchValues,
  descendantsOf,
  filterTree,
  type HierarchyOption,
  indexTree,
  isBranch,
  withoutCovered,
} from './hierarchy-tree';
import { CONTROL_BOX } from './input';
import { CheckBoxMark, CheckMark, EmptyList, hasError, POPOVER, TRIGGER } from './picker-parts';

export type { HierarchyOption } from './hierarchy-tree';

interface HierarchySelectBaseProps {
  /** The visible label (every field has one). */
  label: ReactNode;
  options: readonly HierarchyOption[];
  /**
   * What can be chosen: `leaf` only options without children (a product's category), `any` a
   * branch too (a filter: "Lips" = every lip product). @default 'leaf'
   */
  selectable?: 'leaf' | 'any';
  /** What the field says while nothing is chosen. @default 'Select an option' */
  placeholder?: string;
  /** What the search box says. @default 'Search' */
  searchPlaceholder?: string;
  hint?: ReactNode;
  /** What is wrong; the field is then invalid and described by it. */
  error?: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Sends the value with a native form (hidden inputs, one per chosen option). */
  name?: string;
  id?: string;
  /** Classes of the outer element (label, field, hint, error). */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface SingleHierarchySelectProps extends HierarchySelectBaseProps {
  selectionMode?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
}

export interface MultipleHierarchySelectProps extends HierarchySelectBaseProps {
  /**
   * Several choices, each with a box; the box stays open until "Done". With `selectable="any"` a
   * chosen branch covers everything under it (those show ticked and cannot be chosen apart).
   */
  selectionMode: 'multiple';
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (value: string[]) => void;
}

export type HierarchySelectProps = SingleHierarchySelectProps | MultipleHierarchySelectProps;

const TREE_ROW =
  'text-foreground min-h-touch flex cursor-pointer items-center rounded-lg pe-2 outline-hidden data-focused:bg-surface-muted data-hovered:bg-surface-muted data-focus-visible:ring-focus-ring data-focus-visible:ring-2 data-focus-visible:ring-inset';

/**
 * A field that opens a tree of options (categories, State → District) with a search above it
 * (React Aria's Tree: arrows move, Right/Left open and close a branch, Enter chooses, Escape closes
 * and gives the focus back). A search shows the options that match, everything under them, and
 * the open branches that lead to them. One choice by default (the box closes on it); `selectionMode=
 * "multiple"` gives each option a box.
 *
 * ```tsx
 * <HierarchySelect label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
 * <HierarchySelect label="Areas" selectionMode="multiple" selectable="any" options={AREAS} value={areas} onChange={setAreas} />
 * ```
 */
export function HierarchySelect(props: HierarchySelectProps) {
  const {
    label,
    options,
    selectable = 'leaf',
    placeholder = 'Select an option',
    searchPlaceholder = 'Search',
    hint,
    error,
    isInvalid,
    isRequired = false,
    isDisabled = false,
    name,
    className,
    ref,
  } = props;
  const multiple = props.selectionMode === 'multiple';
  const own = useId();
  const baseId = props.id ?? own;
  const labelId = `${baseId}-label`;
  const valueId = `${baseId}-value`;
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;
  const invalid = isInvalid ?? hasError(error);

  const index = useMemo(() => indexTree(options), [options]);

  // the value as a list, controlled or not
  const initial =
    props.selectionMode === 'multiple'
      ? [...(props.defaultValue ?? [])]
      : props.defaultValue === undefined || props.defaultValue === null
        ? []
        : [props.defaultValue];
  const [ownValue, setOwnValue] = useState<readonly string[]>(initial);
  const controlled = props.value !== undefined;
  const given = props.value;
  // one array per value (not per render), so what is worked out from it is kept
  const chosen = useMemo<readonly string[]>(() => {
    if (given === undefined) return ownValue;
    if (given === null) return [];
    return typeof given === 'string' ? [given] : given;
  }, [given, ownValue]);
  const commit = (next: readonly string[]) => {
    if (!controlled) setOwnValue(next);
    if (props.selectionMode === 'multiple') props.onChange?.([...next]);
    else props.onChange?.(next[0] ?? null);
  };

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<ReadonlySet<Key>>(new Set());
  const treeRef = useRef<HTMLDivElement>(null);

  const { tree, matches } = useMemo(() => filterTree(options, query), [options, query]);
  const searching = query.trim() !== '';

  const canChoose = (option: HierarchyOption) =>
    option.disabled !== true && (selectable === 'any' || !isBranch(option));

  // with `any`, a chosen branch covers what is under it
  const covered = useMemo(() => {
    const found = new Set<string>();
    if (!multiple || selectable !== 'any') return found;
    for (const value of chosen) {
      const entry = index.get(value);
      if (entry !== undefined) for (const below of descendantsOf(entry.option)) found.add(below);
    }
    return found;
  }, [chosen, index, multiple, selectable]);

  const disabledKeys = useMemo(() => {
    const keys = new Set<string>(covered);
    for (const [value, entry] of index) {
      const option = entry.option;
      if (option.disabled === true || (selectable === 'leaf' && isBranch(option))) keys.add(value);
    }
    return keys;
  }, [index, covered, selectable]);

  const openChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      // show where the chosen options are
      const above = new Set<Key>(expanded);
      for (const value of chosen)
        for (const ancestor of index.get(value)?.ancestors ?? []) above.add(ancestor);
      setExpanded(above);
    } else {
      setQuery('');
    }
  };

  const chooseOne = (value: string) => {
    commit([value]);
    openChange(false);
  };

  const toggleExpanded = (value: string) => {
    const next = new Set(expanded);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setExpanded(next);
  };

  const onSelectionChange = (keys: Selection) => {
    const picked = keys === 'all' ? [...index.keys()] : [...keys].map(String);
    if (!multiple) {
      const [first] = picked;
      // pressing the chosen option again keeps it and closes
      if (first === undefined) openChange(false);
      else chooseOne(first);
      return;
    }
    commit(withoutCovered(picked, index));
  };

  /**
   * Enter chooses (or, with several, ticks and unticks) the focused option, as Space does. React
   * Aria's toggle selection leaves Enter to actions, and a row can't have both here.
   */
  const onTreeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter') return;
    const key = (event.target as HTMLElement).closest('[role="row"]')?.getAttribute('data-key');
    const option = key === null || key === undefined ? undefined : index.get(key)?.option;
    if (option === undefined || !canChoose(option) || covered.has(option.value)) return;
    event.preventDefault();
    event.stopPropagation();
    if (!multiple) chooseOne(option.value);
    else if (chosen.includes(option.value))
      commit(chosen.filter((value) => value !== option.value));
    else commit(withoutCovered([...chosen, option.value], index));
  };

  const summary = multiple
    ? chosen.map((value) => index.get(value)?.option.label ?? value).join(', ')
    : ((chosen[0] === undefined ? undefined : index.get(chosen[0])?.path.join(' › ')) ?? '');

  const chosenSet = new Set(chosen);
  const renderOption = (option: HierarchyOption): ReactNode => {
    const branch = isBranch(option);
    const choosable = canChoose(option);
    const isCovered = covered.has(option.value);
    const chosenBelow = branch
      ? descendantsOf(option).filter((value) => chosenSet.has(value)).length
      : 0;
    return (
      <TreeItem
        key={option.value}
        id={option.value}
        textValue={option.label}
        className={cx(TREE_ROW, option.disabled === true && 'cursor-not-allowed opacity-50')}
        // a branch that cannot be chosen opens and closes on a press (and Enter) instead
        {...(branch && !choosable
          ? {
              onAction: () => {
                toggleExpanded(option.value);
              },
            }
          : {})}
      >
        <TreeItemContent>
          {({ hasChildItems, isExpanded, isSelected, level }) => (
            <div
              className="flex min-w-0 flex-1 items-center gap-2"
              style={{ paddingInlineStart: `${String((level - 1) * 1.25)}rem` }}
            >
              {hasChildItems ? (
                <AriaButton
                  slot="chevron"
                  className="text-foreground-muted hover:text-foreground inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md outline-hidden"
                >
                  <IconChevronRight
                    aria-hidden="true"
                    size={18}
                    className={cx('transition-transform', isExpanded && 'rotate-90')}
                  />
                </AriaButton>
              ) : (
                <span aria-hidden="true" className="size-9 shrink-0" />
              )}
              {multiple && choosable && (
                <CheckBoxMark checked={isSelected || isCovered} dim={isCovered} />
              )}
              {multiple && !choosable && isCovered && <CheckBoxMark checked dim />}
              <span className={cx('min-w-0 flex-1 truncate', isSelected && 'font-medium')}>
                {option.label}
              </span>
              {chosenBelow > 0 && !isSelected && (
                <span className="text-foreground-muted shrink-0 text-xs">{chosenBelow} chosen</span>
              )}
              {!multiple && isSelected && <CheckMark className="text-brand" />}
            </div>
          )}
        </TreeItemContent>
        {branch && (
          <Collection items={option.children ?? []} dependencies={[covered, chosen]}>
            {(child) => renderOption(child)}
          </Collection>
        )}
      </TreeItem>
    );
  };

  const describedBy =
    [hint !== undefined && hintId, invalid && hasError(error) && errorId]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      ref={ref}
      data-invalid={invalid || undefined}
      className={cx('group flex flex-col gap-1.5', className)}
    >
      <span id={labelId} className="text-foreground text-sm font-medium">
        {label}
        {isRequired && (
          <>
            <span aria-hidden="true" className="text-error ms-0.5">
              *
            </span>
            {/* a button has no "required" of its own: its name says it */}
            <span className="sr-only">, required</span>
          </>
        )}
      </span>
      <DialogTrigger isOpen={open} onOpenChange={openChange}>
        <AriaButton
          id={baseId}
          isDisabled={isDisabled}
          aria-labelledby={`${labelId} ${valueId}`}
          {...(describedBy === undefined ? {} : { 'aria-describedby': describedBy })}
          className={TRIGGER}
        >
          <span
            id={valueId}
            className={cx('min-w-0 flex-1 truncate', summary === '' && 'text-foreground-subtle')}
          >
            {summary === '' ? placeholder : summary}
          </span>
          <IconChevronDown
            aria-hidden="true"
            size={18}
            className={cx(
              'text-foreground-muted shrink-0 transition-transform',
              open && 'rotate-180',
            )}
          />
        </AriaButton>
        <Popover
          offset={6}
          className={cx(POPOVER, 'flex max-h-104 w-(--trigger-width) min-w-72 flex-col p-2')}
        >
          <AriaDialog
            aria-labelledby={labelId}
            className="flex min-h-0 flex-1 flex-col gap-2 outline-hidden"
          >
            <SearchField
              value={query}
              onChange={setQuery}
              aria-label="Search the options"
              autoFocus
              className="group/search"
            >
              <div className={CONTROL_BOX}>
                <IconSearch
                  aria-hidden="true"
                  size={18}
                  className="text-foreground-muted ms-3 shrink-0"
                />
                <AriaInput
                  placeholder={searchPlaceholder}
                  onKeyDown={(event) => {
                    // from the search into the tree, as in a list
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      treeRef.current?.querySelector<HTMLElement>('[role="row"]')?.focus();
                    }
                  }}
                  className="placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent px-3 py-2 outline-hidden [&::-webkit-search-cancel-button]:hidden"
                />
                <AriaButton className="text-foreground-muted hover:text-foreground size-touch inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg outline-hidden group-data-empty/search:hidden">
                  <IconClose aria-hidden="true" size={16} />
                </AriaButton>
              </div>
            </SearchField>
            <div aria-live="polite" className="sr-only">
              {searching ? `${String(matches)} ${matches === 1 ? 'option' : 'options'} found` : ''}
            </div>
            {/* Enter, caught before the rows: see onTreeKeyDown */}
            <div className="flex min-h-0 flex-1 flex-col" onKeyDownCapture={onTreeKeyDown}>
              <Tree
                ref={treeRef}
                aria-labelledby={labelId}
                items={tree}
                // React Aria keeps rendered rows; these redraw them when what they show changes
                dependencies={[covered, chosen]}
                selectionMode={multiple ? 'multiple' : 'single'}
                selectionBehavior="toggle"
                selectedKeys={chosenSet}
                onSelectionChange={onSelectionChange}
                disabledKeys={disabledKeys}
                disabledBehavior="selection"
                expandedKeys={searching ? new Set(branchValues(tree)) : expanded}
                onExpandedChange={(keys) => {
                  if (!searching) setExpanded(keys);
                }}
                renderEmptyState={() => (
                  <EmptyList>{searching ? 'No matching options' : 'No options'}</EmptyList>
                )}
                className="min-h-0 flex-1 overflow-auto outline-hidden"
              >
                {(option) => renderOption(option)}
              </Tree>
            </div>
            {multiple && (
              <footer className="border-border flex items-center justify-between gap-2 border-t pt-2">
                <Button
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  disabled={chosen.length === 0}
                  onClick={() => {
                    commit([]);
                  }}
                >
                  Clear all
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    openChange(false);
                  }}
                >
                  Done
                </Button>
              </footer>
            )}
          </AriaDialog>
        </Popover>
      </DialogTrigger>
      {hint !== undefined && (
        <p id={hintId} className="text-foreground-muted text-sm">
          {hint}
        </p>
      )}
      {invalid && hasError(error) && (
        <p id={errorId} className="text-error-subtle-foreground flex items-start gap-1.5 text-sm">
          <IconDanger aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {name !== undefined &&
        chosen.map((value) => <input key={value} type="hidden" name={name} value={value} />)}
    </div>
  );
}
