import React, { useState, useEffect, useRef } from 'react';

export const PinesUISelect = ({
    options = [],
    value = null,
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    className = '',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(
        options.find((option) => option.value === value) || null
    );
    const selectRef = useRef(null);

    useEffect(() => {
        const option = options.find((option) => option.value === value);
        setSelectedOption(option || null);
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelect = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
        if (onChange) {
            onChange(option.value);
        }
    };

    return (
        <div ref={selectRef} className={`relative ${className}`} {...props}>
            <button
                type="button"
                onClick={toggleDropdown}
                className={`relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                }`}
                disabled={disabled}
            >
                {selectedOption ? (
                    <span className="block truncate">
                        {selectedOption.label}
                    </span>
                ) : (
                    <span className="block truncate text-gray-400">
                        {placeholder}
                    </span>
                )}
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {options.length > 0 ? (
                        options.map((option, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(option)}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                                    selectedOption &&
                                    selectedOption.value === option.value
                                        ? 'text-white bg-blue-600'
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <span className="block truncate">
                                    {option.label}
                                </span>
                                {selectedOption &&
                                    selectedOption.value === option.value && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <svg
                                                className="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    )}
                            </li>
                        ))
                    ) : (
                        <li className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                            No options available
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};
