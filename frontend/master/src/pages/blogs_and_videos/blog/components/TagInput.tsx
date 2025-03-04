import { useState, useEffect, FC } from "react";
import toast from "react-hot-toast";
import { CloseIcon } from "../../../../icons";
import NewInput from "./NewInput";

// import { TagInputProps } from "../../../types";
// import Input from "../Input/Input";
interface TagInputProps {
  label?: string;
  placeholder?: string;
  tagsData: string[];
  setValue: (value: string[]) => void;
  errorText?: string;
  selectedTagsData?: string[];
}
const TagInput: FC<TagInputProps> = ({
  label = "",
  placeholder = "",
  tagsData = [],
  setValue,
  errorText,
  selectedTagsData = [],
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTagsData);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState(tagsData);

  useEffect(() => {
    setSelectedTags(selectedTagsData);
  }, [selectedTagsData]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
  };

  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filteredTags = tagsData.filter((tag) =>
        tag.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestedTags(filteredTags);
    } else {
      setSuggestedTags(tagsData);
    }
  }, [inputValue, tagsData]);

  // Handle adding new tags
  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      toast.error(`${label} cannot be empty.`);
      return;
    }
    const isDuplicate = selectedTags.some(
      (tag) => tag.toLowerCase() === trimmedValue.toLowerCase()
    );
    if (isDuplicate) {
      toast.error(`${label} already exists.`);
      return;
    }
    const updatedTags = [...selectedTags, trimmedValue];
    setSelectedTags(updatedTags);
    setValue(updatedTags);
    setInputValue("");
    setShowSuggestions(false);
    toast.success(`${label} "${trimmedValue}" added successfully.`);
  };

  // Handle suggestion click
  const handleSuggestionClick = (tag: string) => {
    const isDuplicate = selectedTags.includes(tag);
    if (isDuplicate) {
      toast.error(`${label} already exists.`);
      return;
    }
    const updatedTags = [...selectedTags, tag];
    setSelectedTags(updatedTags);
    setValue(updatedTags);
    setInputValue("");
    setShowSuggestions(false);
    toast.success(`Tag "${tag}" added successfully.`);
  };

  // Handle tag removal
  const handleTagRemove = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    setValue(updatedTags);
    toast.success(`Tag "${tagToRemove}" removed successfully.`);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-end gap-2">
        <div className="flex-grow relative">
          <NewInput
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTag())
            }
            label={label}
            errorText={errorText}
            needButton
            btnOnClick={handleAddTag}
          />
          {showSuggestions && suggestedTags.length > 0 && (
            <div className="absolute top-14 left-0 right-0 z-20 mt-1 bg-white rounded-lg shadow-lg border border-surface-light-contrast1">
              <div className="max-h-48 overflow-y-auto p-1">
                {suggestedTags.map((tag) => (
                  <div
                    key={tag}
                    className="py-1 px-2 hover:bg-surface-light-contrast rounded-md cursor-pointer"
                    onClick={() => handleSuggestionClick(tag)}
                  >
                    <span className="text-surface-dark-primary text-xs">
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className="flex items-center bg-surface-light-contrast border border-surface-light-contrast2 rounded-full px-3 py-1 leading-0 gap-1"
            >
              <span className="text-gray-700 text-xs">{tag}</span>
              <CloseIcon
                className="fill-surface-dark-primary w-3.5 h-3.5 cursor-pointer"
                onClick={() => handleTagRemove(tag)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
