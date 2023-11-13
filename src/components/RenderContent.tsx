import { GrGallery } from "react-icons/gr";
import Loader from "./Loader";
import { IImage } from "../types/globalTypes";
import Image from "./Image";
import { ChangeEvent } from "react";


interface IProps {
  loading: boolean;
  error: boolean;
  images: IImage[],
  moveImageCard: (id: string, atIndex: number) => void;
  findImage: (id: string) => {
    image: IImage;
    index: number;
  };
  handleUploadImage: (e: ChangeEvent<HTMLInputElement>) => void;
}

const RenderContent = ({
  loading,
  error,
  images,
  moveImageCard,
  findImage,
  handleUploadImage
}: IProps) => {

  if (loading) return (
    <div className="min-h-[60vh] flex justify-center items-start mt-4">
      <Loader />
    </div>);

  if (error) return (
    <div className="min-h-[60vh] flex justify-center items-start">
      <h1 className=" text-red-600 text-xl font-semibold mt-10">Something went wrong!</h1>
    </div>
  );

  if (!images.length) return (
    <div className="min-h-[60vh] flex justify-center items-start text-xl font-semibold">
      <p className='mt-10'>Nothing to show. Images are empty!</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4 px-6 rounded-b-md overflow-y-auto">
      {images.map((image, index) => (
        <Image
          key={image?._id}
          id={image?._id}
          url={image?.url}
          imageAlt={image?.alt}
          index={index}
          moveImageCard={moveImageCard}
          findImage={findImage}
        />
      ))}
      <label
        htmlFor="files"
        title="Upload Image"
        className={`w-full h-full flex flex-col justify-center items-center space-y-2 py-8 px-0.5 md:px-2 md:py-10 lg:px-10 lg:py-20 cursor-pointer border-2 border-gray-300 hover:border-gray-500 border-dashed rounded-md text-black hover:text-gray-600 transition-all ease-in duration-300`}
      >
        <span className="md:text-xl">
          <GrGallery />
        </span>
        <span className="text-xs md:text-base">Add Images</span>
        <input
          type="file"
          id="files"
          onChange={(e) => handleUploadImage(e)}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default RenderContent;