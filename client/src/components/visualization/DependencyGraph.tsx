import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Select,
  Flex,
  Text,
  useColorModeValue,
  Button
} from '@chakra-ui/react';
import { 
  ForceGraph2D, 
  ForceGraph3D, 
  ForceGraphVR, 
  ForceGraphAR 
} from 'react-force-graph';

interface GraphNode {
  id: string;
  name: string;
  group: string;
  level?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface DependencyGraphProps {
  title: string;
  nodes: GraphNode[];
  links: GraphLink[];
  getNodeColor?: (node: GraphNode) => string;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({
  title,
  nodes,
  links,
  getNodeColor = () => '#1f77b4' // Default color if not provided
}) => {
  const [viewType, setViewType] = useState<'2d' | '3d'>('2d');
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'white');
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 600 // Fixed height
        });
      }
    };
    
    // Initial sizing
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      ref={containerRef}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">{title}</Heading>
        
        <Select
          size="sm"
          width="150px"
          value={viewType}
          onChange={(e) => setViewType(e.target.value as '2d' | '3d')}
        >
          <option value="2d">2D View</option>
          <option value="3d">3D View</option>
        </Select>
      </Flex>
      
      <Box height="600px" position="relative">
        {viewType === '2d' ? (
          <ForceGraph2D
            graphData={{ nodes, links }}
            nodeLabel={(node: any) => `${node.name} (${node.group})`}
            nodeColor={(node: any) => getNodeColor(node)}
            linkColor={() => '#999'}
            width={dimensions.width}
            height={dimensions.height}
            nodeRelSize={8}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            cooldownTicks={100}
            cooldownTime={2000}
          />
        ) : (
          <ForceGraph3D
            graphData={{ nodes, links }}
            nodeLabel={(node: any) => `${node.name} (${node.group})`}
            nodeColor={(node: any) => getNodeColor(node)}
            linkColor={() => '#999'}
            width={dimensions.width}
            height={dimensions.height}
            nodeRelSize={6}
            enableNodeDrag={false}
            enableNavigationControls={true}
            showNavInfo={true}
          />
        )}
        
        <Box
          position="absolute"
          top={4}
          right={4}
          p={2}
          bg={bgColor}
          borderRadius="md"
          shadow="md"
        >
          <Text fontSize="sm" fontWeight="bold" mb={2}>Legend:</Text>
          <Flex direction="column">
            {[...new Set(nodes.map(node => node.group))].map(group => (
              <Flex key={group} align="center" mb={1}>
                <Box 
                  w={3} 
                  h={3} 
                  borderRadius="full" 
                  bg={getNodeColor({ group } as GraphNode)} 
                  mr={2} 
                />
                <Text fontSize="xs" color={textColor}>{group}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default DependencyGraph;

