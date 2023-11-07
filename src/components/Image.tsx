import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { actionTypes } from "../state/actionTypes";
import { useImages } from "../context/ImageContext";
import { IImage } from "../types/globalTypes";

/**
 * Image Component
 * 
 * @component
 * 
 * Represents an image card with drag-and-drop, checkbox selection, and hover functionalities.
 * 
 * @param {Object} props - The properties of the component.
 * @param {string} props.url - The URL of the image.
 * @param {string} props.imageAlt - The alt text for the image.
 * @param {string} props.id - The unique identifier for the image.
 * @param {number} props.index - The index of the image in the array.
 * @param {function} props.moveImageCard - Callback function to move the image card.
 * @param {function} props.findImage - Callback function to find an image by ID.
 */

interface IProps {
  url: string;
  imageAlt: string;
  id: string;
  index: number;
  moveImageCard: (id: string, atIndex: number) => void;
  findImage: (id: string) => { image: IImage; index: number; };
}


const Image = ({
  url,
  imageAlt,
  id,
  index,
  moveImageCard,
  findImage,
}: IProps) => {
  // Accessing the image context for state management
  const { disPatch } = useImages();

  // State to track checkbox state
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // State to track hover state
  const [isHovered, setIsHovered] = useState<boolean>(false);

  /**
   * Handles the change in the checkbox state.
   * Toggles the checkbox state and dispatches an action for image selection.
   */
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    disPatch({
      type: actionTypes.SELECT_IMAGE,
      payload: { index, isSelected: !isChecked },
    });
  };

  // Get the original index of the image
  const originalIndex = findImage(id)?.index;

  // Use drag and drop hooks
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
        // If the image is not dropped, move it back to the original position
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
        // If the dragged image is different from the current image, move the card
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

  /**
   * Handles mouse enter event to set hover state to true.
   */
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  /**
   * Handles mouse leave event to set hover state to false.
   */
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-pointer transition-opacity  border-3 border-red-600 ${index === 0 ? "col-span-2 row-span-2" : " "
        } ${opacityClasses}`}
    >
      {/* Overlay for highlighting on hover */}
      <div
        className={`absolute inset-0 bg-gray-800 opacity-50 rounded-md ${visibilityClasses} transition-all duration-300 ease-in`}
      ></div>
      {/* Checkbox for image selection */}
      <label htmlFor="checked">
        <input
          type="checkbox"
          id={id}
          checked={isChecked}
          onChange={handleCheckboxChange}
          className={`absolute top-2 left-2 text-indigo-500 cursor-pointer w-5 h-5 ${visibilityClasses} transition-all duration-300 ease-in`}
        />
        {/* Image */}
        <img
          src={url}
          alt={imageAlt}
          loading="lazy"
          className="w-full h-full rounded-md shadow-md aspect-square border"
        />
      </label>
    </div>
  );
};

export default Image;
