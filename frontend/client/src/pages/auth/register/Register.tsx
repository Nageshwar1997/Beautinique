import { ChangeEvent, FormEvent, useState } from "react";
import { initialRegisterData, RegisterTextContent } from "./constants";
import {
  validateEmail,
  validateName,
  validateNumber,
  validatePassword,
} from "../../../validators";
import AuthRobot from "../components/AuthRobot";
import UploadProfile from "../components/UploadProfile";
import TextDisplay from "../../../components/TextDisplay";
import SocialAuth from "../components/SocialAuth";
import Input from "../../../components/input/Input";

const Register = () => {
  const [data, setData] = useState(initialRegisterData || {});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "firstName" || name === "lastName") {
      if (validateName(value)) {
        setData((prevData) => ({ ...prevData, [name]: value }));
      }
    } else if (name === "email") {
      if (validateEmail(value)) {
        setData((prevData) => ({ ...prevData, [name]: value }));
      }
    } else if (name === "password" || name === "confirmPassword") {
      if (validatePassword(value)) {
        setData((prevData) => ({ ...prevData, [name]: value }));
      }
    } else if (name === "phoneNumber") {
      const newValue = validateNumber(value);
      setData((prevData) => ({ ...prevData, [name]: newValue }));
    } else {
      setData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  console.log("Data", data);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Data Submit", data);
  };

  return (
    <div className="w-full min-h-dvh p-4 flex gap-4 overflow-hidden">
      <AuthRobot />
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center gap-4 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full flex flex-col gap-4 overflow-hidden overflow-y-scroll"
        >
          <div className="text-center mb-3">
            <UploadProfile />
            <TextDisplay
              content={RegisterTextContent}
              contentClassName="mt-3 font-semibold"
            />
          </div>
          <SocialAuth />
          <div className="w-full sm:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
            <div className="shadow-shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-4 md:gap-y-5 lg:gap-y-6">
                <div className="">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={data.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="">
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={data.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Input
                    label="Email"
                    name="email"
                    value={data.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Input
                    label="Phone Number"
                    name="phoneNumber"
                    value={data.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="">
                  <Input
                    label="Password"
                    name="password"
                    value={data.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="">
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    value={data.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <button type="submit" className="text-white">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
