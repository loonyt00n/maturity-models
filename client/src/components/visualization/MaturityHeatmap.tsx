import React from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';

interface HeatmapCell {
  id: string;
  name: string;
  level: number;
  percentage: number;
}

interface HeatmapRow {
  id: string;
  name: string;
  cells: HeatmapCell[];
}

interface MaturityHeatmapProps {
  title: string;
  rows: HeatmapRow[];
  getMaturityLevelColor: (level: number) => string;
}

const MaturityHeatmap: React.FC<MaturityHeatmapProps> = ({
  title,
  rows,
  getMaturityLevelColor
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
    >
      <Heading size="md" mb={4}>{title}</Heading>
      
      <Box overflowX="auto">
        <Flex>
          <Box
            minWidth="200px"
            p={2}
            fontWeight="bold"
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            Service / Journey
          </Box>
          
          {rows[0]?.cells.map((cell) => (
            <Box
              key={cell.id}
              minWidth="100px"
              p={2}
              textAlign="center"
              fontWeight="bold"
              borderBottomWidth="1px"
              borderColor={borderColor}
            >
              {cell.name}
            </Box>
          ))}
        </Flex>
        
        {rows.map((row) => (
          <Flex key={row.id}>
            <Box
              minWidth="200px"
              p={2}
              fontWeight="medium"
              borderBottomWidth="1px"
              borderColor={borderColor}
            >
              {row.name}
            </Box>
            
            {row.cells.map((cell) => (
              <Box
                key={cell.id}
                minWidth="100px"
                p={2}
                textAlign="center"
                borderBottomWidth="1px"
                borderColor={borderColor}
                bg={`${getMaturityLevelColor(cell.level)}.${cell.percentage >= 75 ? '500' : cell.percentage >= 50 ? '400' : cell.percentage >= 25 ? '300' : '200'}`}
                color={cell.percentage >= 50 ? 'white' : 'black'}
              >
                Level {cell.level}
              </Box>
            ))}
          </Flex>
        ))}
      </Box>
    </Box>
  );
};

export default MaturityHeatmap;

