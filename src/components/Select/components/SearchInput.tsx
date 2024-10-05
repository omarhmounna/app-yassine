import React, { forwardRef, useContext } from "react";
import { SearchIcon } from "./Icons";
import { SelectContext } from "./SelectProvider";

interface SearchInputProps {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
    { placeholder = "", value = "", onChange, name = "" },
    ref
) {
    const { classNames } = useContext(SelectContext);
    return (
        <div className="relative flex items-center py-1 px-2.5 lg:flex w-full">
            <SearchIcon className="absolute left-5 w-5 h-5 text-gray-500" />
            <input
                ref={ref}
                className="w-full py-1 pl-10 pr-2 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded focus:border-gray-200 focus:ring-0 focus:outline-none"
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                name={name}
                autoFocus={false}
            />
        </div>
    );
});

export default SearchInput;
