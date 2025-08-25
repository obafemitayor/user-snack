import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  Text,
  Select,
  IconButton,
} from '@chakra-ui/react';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  onPageChange, 
  itemsPerPage = 10 
}) => {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getVisiblePages = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box>
      <HStack justify="space-between" align="center" spacing={4}>
        <Text fontSize="sm" color="gray.600">
          Showing {startItem} to {endItem} of {totalItems} results
        </Text>
        
        <HStack spacing={2}>
          <IconButton
            icon={<ChevronLeftIcon aria-hidden />}
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            size="sm"
            variant="outline"
            aria-label="Previous page"
          />
          
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <Text px={2}>...</Text>
              ) : (
                <Button
                  size="sm"
                  variant={currentPage === page ? 'solid' : 'outline'}
                  colorScheme={currentPage === page ? 'orange' : 'gray'}
                  onClick={() => handlePageChange(page as number)}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
          
          <IconButton
            icon={<ChevronRightIcon aria-hidden />}
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            size="sm"
            variant="outline"
            aria-label="Next page"
          />
        </HStack>
        
        <HStack spacing={2}>
          <Text fontSize="sm" color="gray.600">
            Go to page:
          </Text>
          <Select
            size="sm"
            value={currentPage}
            onChange={(e) => handlePageChange(parseInt(e.target.value))}
            w="80px"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </Select>
        </HStack>
      </HStack>
    </Box>
  );
};

export default Pagination;
