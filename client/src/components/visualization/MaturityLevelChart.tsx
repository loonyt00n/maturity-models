import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Select,
  useColorModeValue
} from '@chakra-ui/react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface MaturityDimension {
  dimension: string;
  level: number;
  percentage: number;
}

interface MaturityChartProps {
  title: string;
  dimensions: MaturityDimension[];
  getMaturityLevelColor: (level: number) => string;
}

const MaturityLevelChart: React.FC<MaturityChartProps> = ({
  title,
  dimensions,
  getMaturityLevelColor
}) => {
  const [chartType, setChartType] = useState<'level' | 'percentage'>('level');
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const formatData = () => {
    return dimensions.map(dim => ({
      subject: dim.dimension,
      A: chartType === 'level' ? dim.level : dim.percentage,
      fullMark: chartType === 'level' ? 4 : 100
    }));
  };
  
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">{title}</Heading>
        
        <Select
          size="sm"
          width="150px"
          value={chartType}
          onChange={(e) => setChartType(e.target.value as 'level' | 'percentage')}
        >
          <option value="level">Maturity Level</option>
          <option value="percentage">Percentage</option>
        </Select>
      </Flex>
      
      <Box height="300px">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formatData()}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis
              angle={30}
              domain={[0, chartType === 'level' ? 4 : 100]}
            />
            <Radar
              name={chartType === 'level' ? 'Maturity Level' : 'Completion Percentage'}
              dataKey="A"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
      
      <Flex wrap="wrap" mt={4} justify="center">
        {dimensions.map((dim) => (
          <Box
            key={dim.dimension}
            m={2}
            p={2}
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
          >
            <Text fontWeight="medium" fontSize="sm">{dim.dimension}</Text>
            <Flex mt={1} align="center">
              <Badge
                colorScheme={getMaturityLevelColor(dim.level)}
                mr={2}
              >
                Level {dim.level}
              </Badge>
              <Text fontSize="xs">{dim.percentage}%</Text>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default MaturityLevelChart;

