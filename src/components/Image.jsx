/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";

const Image = ({
  image,
  imageAlt,
  id,
  index,
  moveImageCard,
  onImageSelect,
  findImage,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    onImageSelect(index, !isChecked);
  };

  const originalIndex = findImage(id)?.index;
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "IMAGE",
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        console.log("item", item);
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveImageCard(droppedId, originalIndex);
        }
      },
    }),
    [id, originalIndex, moveImageCard]
  );
  const [, drop] = useDrop(
    () => ({
      accept: "IMAGE",
      hover({ id: draggedId }) {
        console.log("draggedId", draggedId);
        if (draggedId !== id) {
          const { index: overIndex } = findImage(id);
          moveImageCard(draggedId, overIndex);
        }
      },
    }),
    [findImage, moveImageCard]
  );
  const opacity = isDragging ? 0.5 : 1;
  return (
    <div
      ref={(node) => drag(drop(node))}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-pointer transition-opacity ${
        index === 0 ? "col-span-2 row-span-2" : " "
      }`}
      style={{
        opacity,
      }}
    >
      <div
        className="absolute inset-0 bg-gray-800 opacity-50 rounded-md"
        style={{
          visibility: isHovered || isChecked ? "visible" : "hidden",
          transition: "visibility 0.3s, opacity 0.3s ease-in",
        }}
      ></div>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="absolute top-2 left-2 text-white cursor-pointer w-5 h-5"
        style={{ visibility: isHovered || isChecked ? "visible" : "hidden" }}
      />
      <img
        src={image}
        alt={imageAlt}
        className="w-full h-full rounded-md shadow-sm aspect-square border"
      />
    </div>
  );
};

export default Image;
