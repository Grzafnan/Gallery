import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { actionTypes } from "../state/actionTypes";
import { useImages } from "../context/ImageContext";
import { IImage } from "../types/globalTypes";
import Checkbox from "./Checkbox";

// Define the props interface for the Image component
interface IProps {
  url: string;
  imageAlt: string;
  id: string;
  index: number;
  moveImageCard: (id: string, atIndex: number) => void;
  findImage: (id: string) => { image: IImage; index: number };
}

// Define the Image component
const Image = ({
  url,
  imageAlt,
  id,
  index,
  moveImageCard,
  findImage,
}: IProps) => {
  // Access the image context for state management
  const { disPatch } = useImages();

  // Use state to track checkbox and hover states
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Function to handle checkbox state changes
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    disPatch({
      type: actionTypes.SELECT_IMAGE,
      payload: { index, isSelected: !isChecked },
    });
  };

  // Get the original index of the image
  const originalIndex = findImage(id)?.index;

  // Use drag and drop hooks for image card movement
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "IMAGE",
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveImageCard(droppedId, originalIndex);
        }
      },
    }),
    [id, originalIndex, moveImageCard]
  );

  // Use drop hook for hovering over the image
  const [, drop] = useDrop(
    () => ({
      accept: "IMAGE",
      hover({ id: draggedId }: { id: string }) {
        if (draggedId !== id) {
          const { index: overIndex } = findImage(id);
          moveImageCard(draggedId, overIndex);
        }
      },
    }),
    [findImage, moveImageCard]
  );

  // Apply opacity and visibility classes based on drag and hover states
  const opacityClasses = isDragging ? "opacity-50" : "opacity-100";
  const visibilityClasses = isHovered || isChecked ? "visible" : "hidden";

  return (
    <div
      ref={(node) => drag(drop(node))}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-pointer transition-opacity  border-3 border-red-600 ${index === 0 ? "col-span-2 row-span-2" : " "
        } ${opacityClasses}`}
    >
      {/* Overlay for highlighting on hover */}
      <div
        className={`absolute inset-0 bg-gray-800 opacity-50 rounded-md ${visibilityClasses} transition-all duration-300 ease-in`}
      ></div>
      {/* Render the Checkbox component */}
      <Checkbox
        id={id}
        isChecked={isChecked}
        onChange={handleCheckboxChange}
        url={url}
        imageAlt={imageAlt}
        visibilityClasses={visibilityClasses}
      />
    </div>
  );
};

export default Image;