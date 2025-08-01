"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import PhoneInput, { getCountries } from "react-phone-number-input";
import { E164Number } from "libphonenumber-js/core";
import { parsePhoneNumber, isValidPhoneNumber, CountryCode, getCountryCallingCode } from "libphonenumber-js";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import flags from 'react-phone-number-input/flags';

// Import the default styles for the phone input
import "react-phone-number-input/style.css";

// Define a type for the custom input component props
type CustomInputComponentProps = React.ComponentProps<typeof Input> & {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// Custom input component that wraps shadcn Input
const CustomInputComponent = React.forwardRef<HTMLInputElement, CustomInputComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(className)}
        {...props}
      />
    );
  }
);

CustomInputComponent.displayName = "CustomInputComponent";

// Define types for the country option
type CountryOption = string | { value: string; label: string };

// Create a custom country select component
const CustomCountrySelect = ({ 
  value, 
  onChange, 
  options, 
  ...rest 
}: any) => {
  const t = useTranslations('phoneInput');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isRtl, setIsRtl] = useState(false);
  
  // Check RTL on component mount to avoid hydration issues
  useEffect(() => {
    setIsRtl(document.dir === 'rtl' || document.documentElement.lang === 'ar');
  }, []);

  // Helper to get option value (handles both string and object options)
  const getOptionValue = (option: CountryOption): string => {
    if (typeof option === 'string') {
      return option;
    }
    return option.value;
  };

  // Filter countries based on search
  const filteredOptions = searchQuery ? 
    options.filter((option: CountryOption) => {
      const optionValue = getOptionValue(option);
      const countryName = getCountryDisplayName(optionValue).toLowerCase();
      return countryName.includes(searchQuery.toLowerCase());
    }) : 
    options;

  // Helper to get country display name
  function getCountryDisplayName(countryCode: string) {
    try {
      // Use Arabic names for RTL, English names otherwise
      const regionNames = new Intl.DisplayNames([isRtl ? 'ar' : 'en'], { type: 'region' });
      return regionNames.of(countryCode) || countryCode;
    } catch (error) {
      return countryCode;
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {value && (
          <>
            <span className="w-5 h-4 overflow-hidden rounded-sm flex-shrink-0">
              {flags[value as CountryCode] ? React.createElement(flags[value as CountryCode] as React.ComponentType) : null}
            </span>
            <span className="text-xs">+{getCountryCallingCode(value as CountryCode)}</span>
          </>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 opacity-70"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className={`absolute z-50 mt-1 max-h-60 w-56 overflow-auto rounded-md  dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none sm:text-sm ${isRtl ? 'right-0' : 'left-0'}`}>
          <div className="px-2 py-1 sticky top-0  dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700">
            <Input
              type="text"
              placeholder={t('countryPlaceholder')}
              className="h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="py-1" role="listbox">
            {filteredOptions.map((option: CountryOption, index: number) => {
              const optionValue = getOptionValue(option);
              return (
                <li
                  key={`${optionValue}-${index}`}
                  role="option"
                  aria-selected={optionValue === value}
                  className={cn(
                    "cursor-pointer flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                    optionValue === value && "bg-gray-100 dark:bg-gray-700"
                  )}
                  onClick={() => {
                    onChange(optionValue);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <span className="w-6 h-4 overflow-hidden rounded-sm flex-shrink-0">
                    {optionValue && typeof optionValue === 'string' && flags[optionValue as CountryCode] 
                      ? React.createElement(flags[optionValue as CountryCode] as React.ComponentType) 
                      : null}
                  </span>
                  <span className="dark:text-gray-200">
                    {typeof optionValue === 'string' ? getCountryDisplayName(optionValue) : ''}
                  </span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {typeof optionValue === 'string' ? `+${getCountryCallingCode(optionValue as CountryCode)}` : ''}
                  </span>
                </li>
              );
            })}
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// Custom interface for our PhoneNumberInput component
export interface PhoneInputCustomProps {
  value?: string;
  onChange?: (value: E164Number | undefined) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  required?: boolean;
  defaultCountry?: CountryCode;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneNumberInput = React.forwardRef<HTMLDivElement, PhoneInputCustomProps>(
  ({ 
    value, 
    onChange, 
    onBlur,
    id, 
    name, 
    label, 
    error, 
    required = false, 
    defaultCountry = "SA", 
    className,
    inputClassName,
    labelClassName,
    errorClassName,
    disabled,
    placeholder,
    ...props 
  }, ref) => {
    const t = useTranslations('phoneInput');
    const [phoneValue, setPhoneValue] = useState<E164Number | undefined>(value as E164Number | undefined);
    const [isValid, setIsValid] = useState<boolean>(true);
    const [isTouched, setIsTouched] = useState<boolean>(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Handle change events from the phone input
    const handleChange = (value: E164Number | undefined) => {
      setPhoneValue(value);
      setIsValid(value ? isValidPhoneNumber(value) : true);
      onChange && onChange(value);
    };

    // Handle blur events
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTouched(true);
      onBlur && onBlur(e);
    };

    // Forward ref to container div
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Update value if it changes externally
    useEffect(() => {
      if (value !== phoneValue) {
        setPhoneValue(value as E164Number | undefined);
      }
    }, [value, phoneValue]);

    return (
      <div className={cn("space-y-2", className)} ref={containerRef}>
        {label && (
          <Label 
            htmlFor={id} 
            className={cn(
              required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : "",
              labelClassName
            )}
          >
            {label || t('label')}
          </Label>
        )}
        <div 
          className={cn(
            "phone-input-container relative",
            isValid || !isTouched ? "" : "has-error"
          )}
        >
          <PhoneInput
            international
            countryCallingCodeEditable={false}
            defaultCountry={defaultCountry}
            value={phoneValue}
            onChange={handleChange}
            onBlur={handleBlur}
            countrySelectComponent={CustomCountrySelect}
            flags={flags}
            className={cn("flex", inputClassName)}
            inputComponent={CustomInputComponent as any}
            placeholder={placeholder || t('placeholder')}
            name={name}
            id={id}
            disabled={disabled}
          />
        </div>
        {(error || (!isValid && isTouched)) && (
          <p className={cn("text-red-500 text-sm mt-1", errorClassName)}>
            {error || t('invalid')}
          </p>
        )}
      </div>
    );
  }
);

PhoneNumberInput.displayName = "PhoneNumberInput";

export { PhoneNumberInput };