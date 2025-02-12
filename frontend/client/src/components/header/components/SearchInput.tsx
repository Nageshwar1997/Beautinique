import { SearchIcon } from "../../../icons";

const SearchInput = ({ className }: { className?: string }) => {
  return (
    <div
      className={`max-w-96 w-full flex-grow h-9 hidden rounded-md overflow-hidden bg-secondary xl:flex items-center focus-within:border focus-within:shadow-lg focus-within:shadow-primary-10 focus-within:border-primary-50 ${className}`}
    >
      <input
        type="text"
        placeholder="Search Beautinique"
        className="w-full h-full pl-4 pr-1 py-1 text-sm focus:outline-none focus:border-none bg-transparent placeholder:text-primary-50"
      />
      <SearchIcon className="w-5 h-5 [&>path]:stroke-primary-50 mr-3" />
    </div>
  );
};

export default SearchInput;
