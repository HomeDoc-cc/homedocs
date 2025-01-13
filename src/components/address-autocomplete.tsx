'use client';

import { Autocomplete } from '@react-google-maps/api';
import { useEffect, useRef, useState } from 'react';

interface AddressAutocompleteProps {
  defaultValue?: string;
  value?: string;
  onChange: (address: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  defaultValue,
  value,
  onChange,
  required,
  className = '',
  placeholder = 'e.g., 123 Ocean Drive',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [controlledValue, setControlledValue] = useState(value || '');

  // Handle controlled input updates
  useEffect(() => {
    if (value !== undefined) {
      setControlledValue(value);
    }
  }, [value]);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocomplete.setFields(['formatted_address']);
  };

  const onPlaceChanged = (autocomplete: google.maps.places.Autocomplete) => {
    const place = autocomplete.getPlace();
    if (place.formatted_address) {
      onChange(place.formatted_address);
      setControlledValue(place.formatted_address);
    }
  };

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={() => {
        const autocomplete = inputRef.current as unknown as google.maps.places.Autocomplete;
        onPlaceChanged(autocomplete);
      }}
      options={{ types: ['address'] }}
    >
      <input
        type="text"
        ref={inputRef}
        required={required}
        className={className}
        placeholder={placeholder}
        value={value !== undefined ? controlledValue : undefined}
        defaultValue={defaultValue}
        onChange={(e) => {
          if (value !== undefined) {
            setControlledValue(e.target.value);
            onChange(e.target.value);
          }
        }}
      />
    </Autocomplete>
  );
} 