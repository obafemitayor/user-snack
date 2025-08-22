import React from 'react';

// Mock all Chakra UI components as simple divs with their children
const mockComponent = (displayName) => {
  const Component = ({ children, ...props }) => React.createElement('div', props, children);
  Component.displayName = displayName;
  return Component;
};

export const ChakraProvider = ({ children }) => React.createElement('div', null, children);
export const Box = mockComponent('Box');
export const VStack = mockComponent('VStack');
export const HStack = mockComponent('HStack');
export const Text = mockComponent('Text');
export const Heading = mockComponent('Heading');
export const Button = mockComponent('Button');
export const Input = mockComponent('Input');
export const Select = mockComponent('Select');
export const FormControl = mockComponent('FormControl');
export const FormLabel = mockComponent('FormLabel');
export const Badge = mockComponent('Badge');
export const Spinner = mockComponent('Spinner');
export const Image = mockComponent('Image');
export const NumberInput = mockComponent('NumberInput');
export const NumberInputField = mockComponent('NumberInputField');
export const NumberInputStepper = mockComponent('NumberInputStepper');
export const NumberIncrementStepper = mockComponent('NumberIncrementStepper');
export const NumberDecrementStepper = mockComponent('NumberDecrementStepper');
export const IconButton = mockComponent('IconButton');
export const useToast = () => jest.fn();
export const Container = mockComponent('Container');
export const Grid = mockComponent('Grid');
export const GridItem = mockComponent('GridItem');
export const Card = mockComponent('Card');
export const CardBody = mockComponent('CardBody');
export const CardHeader = mockComponent('CardHeader');
export const Divider = mockComponent('Divider');
export const SimpleGrid = mockComponent('SimpleGrid');
