import { LazyLoadImage } from "react-lazy-load-image-component";

interface Props {
  id: string;
  isChecked: boolean;
  onChange: () => void;
  visibilityClasses: string;
  url: string;
  imageAlt: string;
}


const Checkbox = ({ id, isChecked, onChange, visibilityClasses, url, imageAlt }: Props) => {
  return (
    <div>
      <label htmlFor="checked">
        <input
          type="checkbox"
          id={id}
          checked={isChecked}
          onChange={onChange}
          className={`absolute top-2 left-2 text-indigo-500 cursor-pointer w-5 h-5 ${visibilityClasses} transition-all duration-300 ease-in`}
        />
        {/* Image */}
        <LazyLoadImage
          src={url}
          alt={imageAlt}
          loading="lazy"
          className="w-full h-full rounded-md shadow-md aspect-square border"
        />
      </label>
    </div>
  )
};

export default Checkbox;