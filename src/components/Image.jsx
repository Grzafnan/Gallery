/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";

/**
 * Image Component
 * @param {string} url - The URL of the image.
 * @param {string} imageAlt - The alt text for the image.
 * @param {string} id - The unique identifier for the image.
 * @param {number} index - The index of the image in the array.
 * @param {function} moveImageCard - Callback function to move the image card.
 * @param {function} onImageSelect - Callback function to handle image selection.
 * @param {function} findImage - Callback function to find image by ID.
 */
const Image = ({
  url,
  imageAlt,
  id,
  index,
  moveImageCard,
  onImageSelect,
  findImage,
}) => {
  // State to track checkbox state
  const [isChecked, setIsChecked] = useState(false);
  // State to track hover state
  const [isHovered, setIsHovered] = useState(false);

  // Function to handle checkbox change
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    onImageSelect(index, !isChecked);
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
      hover({ id: draggedId }) {
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

  return (
    <div
      ref={(node) => drag(drop(node))}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-pointer transition-opacity  border-3 border-red-600 ${
        index === 0 ? "col-span-2 row-span-2" : " "
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
          className={`absolute top-2 left-2 text-white cursor-pointer w-5 h-5 ${visibilityClasses}`}
        />
        {/* Image */}
        <img
          src={url}
          alt={imageAlt}
          className="w-full h-full rounded-md shadow-sm aspect-square border"
        />
      </label>
    </div>
  );
};

export default Image;
