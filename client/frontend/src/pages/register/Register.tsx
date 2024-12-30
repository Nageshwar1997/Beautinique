import { CATEGORY } from "./data";

const Register = () => {
  const images = CATEGORY.flatMap((category) => category.images).map(
    (item, index) => ({
      ...item,
      className:
        index === 0 || index === 16
          ? "col-span-1 row-span-1 max-h-[182px] max-w-[190px] lg:row-span-2 lg:col-span-2 lg:max-h-[374px] lg:max-w-[398px]"
          : index === 9
          ? "row-span-2 col-span-2 max-h-[374px] max-w-[398px] lg:row-span-1 lg:col-span-1 lg:max-h-[182px] lg:max-w-[190px]"
          : "max-h-[182px] max-w-[190px]",
    })
  );

  return (
    <>
      <div className="w-screen h-screen overflow-hidden">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 p-2">
          {images.map((image, index) => (
            <img
              key={index}
              className={`${
                image.className
              } h-full w-full object-cover opacity-50 hover:opacity-100 rounded-md md:rounded-2xl ${
                index > 17 && "hidden md:block"
              }`}
              src={image.image}
              alt={image.id.toString()}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Register;
