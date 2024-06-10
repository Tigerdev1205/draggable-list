"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop, DropTargetMonitor, DragSourceMonitor } from 'react-dnd';
import { HTML5Backend, getEmptyImage } from 'react-dnd-html5-backend';
import { useDragLayer, XYCoord } from 'react-dnd';
import update from 'immutability-helper';

const ItemTypes = {
  CARD: 'card',
};

interface CardProps {
  id: number;
  text: string;
  image: string;
  location: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: number;
  type: string;
  text: string;
  image: string;
}

const Card: React.FC<CardProps> = ({ id, text, image, location, index, moveCard }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<DragItem, void, { handlerId: string | symbol }>({
    accept: ItemTypes.CARD,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index, text, image },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} className="p-4 bg-white shadow-md flex items-center" style={{ opacity }}>
      <img src={image} alt={text} className="w-16 h-16 object-cover rounded mr-4" />
      <div>
        <div className="font-bold">{text}</div>
        <div className="text-sm text-[#A8A9AE] flex items-center">
          <img src="/icons/location.svg" alt="Location" className="w-4 h-4 mr-1" />
          {location}
        </div>
      </div>
    </div>
  );
};

const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const getItemStyles = (currentOffset: XYCoord) => {
    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`; // Adjust these values to match the preview position
    return {
      transform,
      WebkitTransform: transform,
    };
  };

  return (
    <div className="custom-drag-layer">
      <div
        className="custom-drag-preview"
        style={getItemStyles(currentOffset)}
      >
        <div className="p-2 border-2 border-blue-500 bg-white shadow-md flex items-center">
          <img src={item.image} alt={item.text} className="w-10 h-10 object-cover rounded mr-2" />
          <div>
            <div className="font-bold text-sm">{item.text}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DraggableList: React.FC = () => {
  const [cards, setCards] = useState([
    { id: 1, text: 'Scotland Island', image: '/images/scotland1.svg', location: 'Sydney, Australia' },
    { id: 2, text: 'The Charles Grand Brasserie & Bar', image: '/images/charles.svg', location: 'Lorem ipsum, Dolor' },
    { id: 3, text: 'Bridge Climb', image: '/images/bridge.svg', location: 'Dolor, Sit amet' },
    { id: 4, text: 'Scotland Island', image: '/images/scotland2.svg', location: 'Sydney, Australia' },
    { id: 5, text: 'Clam Bar', image: '/images/clam.svg', location: 'Etcetera veni, Vidi vici' },
    { id: 6, text: 'Vivid Festival', image: '/images/vivid.svg', location: 'Sydney, Australia' },
  ]);

  const moveCard = (fromIndex: number, toIndex: number) => {
    const updatedCards = update(cards, {
      $splice: [
        [fromIndex, 1],
        [toIndex, 0, cards[fromIndex]],
      ],
    });
    setCards(updatedCards);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-md mt-10">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            index={index}
            id={card.id}
            text={card.text}
            image={card.image}
            location={card.location}
            moveCard={moveCard}
          />
        ))}
        <CustomDragLayer />
      </div>
    </DndProvider>
  );
};

export default DraggableList;
