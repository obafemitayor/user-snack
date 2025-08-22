import React from 'react';

// Mock all Chakra UI icons as simple span elements
const mockIcon = (displayName) => {
  const Icon = (props) => React.createElement('span', { ...props, 'data-testid': displayName });
  Icon.displayName = displayName;
  return Icon;
};

export const ArrowBackIcon = mockIcon('ArrowBackIcon');
export const ChevronLeftIcon = mockIcon('ChevronLeftIcon');
export const ChevronRightIcon = mockIcon('ChevronRightIcon');
export const DeleteIcon = mockIcon('DeleteIcon');
