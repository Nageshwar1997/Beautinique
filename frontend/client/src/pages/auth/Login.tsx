import { ChangeEvent, FormEvent, RefObject, useState } from "react";
import {
  initialLoginData,
  loginInputMapData,
  LoginTextContent,
  validateLoginForm,
} from "./constants";
import {
  validateEmail,
  validateNumber,
  validatePassword,
} from "../../validators";
import AuthRobot from "./components/AuthRobot";
import TextDisplay from "../../components/TextDisplay";
import SocialAuth from "./components/SocialAuth";
import PhoneInput from "../../components/input/PhoneInput";
import Input from "../../components/input/Input";
import { EyeIcon, EyeOffIcon } from "../../components/icons";
import useVerticalScrollable from "../../hooks/useVerticalScrollable";
import Radio from "../../components/input/Radio";
import { LoginField, VerticalScrollType } from "../../types";
import Button from "../../components/button/Button";
import Checkbox from "../../components/input/Checkbox";
import { Link } from "react-router-dom";
import { BottomGradient, TopGradient } from "../../components/Gradients";
import { useLoginUser } from "../../api/user/user.service";

const Login = () => {
  const loginMutation = useLoginUser();

  const [showGradient, containerRef] = useVerticalScrollable();

  const [loginUsing, setLoginUsing] = useState<"email" | "phoneNumber">(
    "phoneNumber"
  );
  const [data, setData] = useState(initialLoginData);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<Record<LoginField, string>>>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === "email" && validateEmail(value)) {
      setData((prevData) => ({ ...prevData, [name]: value }));
    } else if (name === "password" && validatePassword(value)) {
      setData((prevData) => ({ ...prevData, [name]: value }));
    } else if (name === "phoneNumber") {
      const newValue = validateNumber(value);
      setData((prevData) => ({ ...prevData, [name]: newValue }));
    } else if (type === "checkbox" && name === "remember") {
      setData((prevData) => ({ ...prevData, [name]: checked }));
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const toggleRadio = (value: string) => {
    setLoginUsing(value as "email" | "phoneNumber");
    setErrors((prevErrors) => ({
      ...prevErrors,
      phoneNumber: "",
      email: "",
    }));
    setData((prevData) => ({
      ...prevData,
      phoneNumber: "",
      email: "",
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedErrors = validateLoginForm(data, loginUsing);

    if (Object.values(updatedErrors).some((error) => error !== "")) {
      setErrors(updatedErrors);
      return;
    }

    loginMutation.mutate(data);

    console.log("data page", data);
  };

  return (
    <div className="w-full min-h-dvh max-h-dvh h-full p-4 flex gap-4 overflow-hidden relative">
      <AuthRobot />
      <div
        ref={containerRef as RefObject<HTMLDivElement>}
        className={`w-full md:w-1/2 flex flex-col items-center gap-4 overflow-hidden overflow-y-scroll ${
          !(showGradient as VerticalScrollType).bottom &&
          !(showGradient as VerticalScrollType).top
            ? "justify-center"
            : "justify-start"
        }`}
      >
        {(showGradient as VerticalScrollType).top && <TopGradient />}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full flex flex-col gap-4"
        >
          <TextDisplay
            content={LoginTextContent}
            contentClassName="mb-3 font-semibold"
          />
          <SocialAuth />
          <div className="w-full max-w-[400px] lg:max-w-[500px] sm:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
            <div className="shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6">
              <Radio
                value={loginUsing}
                onChange={(value) => toggleRadio(value)}
                options={[
                  { label: "Phone", value: "phoneNumber" },
                  { label: "Email", value: "email" },
                ]}
              />
              <div className="flex flex-col gap-5 lg:gap-6">
                {loginInputMapData.map((item, ind) => {
                  if (
                    item.name === "phoneNumber" &&
                    loginUsing !== "phoneNumber"
                  ) {
                    return null; // Skip PhoneInput if not using phoneNumber
                  }

                  if (item.name === "email" && loginUsing !== "email") {
                    return null; // Skip Input for email if not using email
                  }

                  return (
                    <div key={ind}>
                      {item.name === "phoneNumber" ? (
                        <PhoneInput
                          autoComplete={item?.autoComplete}
                          label={item?.label}
                          type={item?.type}
                          placeholder={item?.placeholder}
                          name={item?.name}
                          value={data[item?.name] as string}
                          onChange={handleInputChange}
                          errorText={errors[item?.name]}
                        />
                      ) : (
                        <Input
                          autoComplete={item?.autoComplete}
                          label={item?.label}
                          type={
                            item.name === "password"
                              ? "password" // Always show password as a password field
                              : item?.type
                          }
                          placeholder={item?.placeholder}
                          name={item?.name}
                          value={data[item?.name] as string}
                          onChange={handleInputChange}
                          icon={
                            item.name === "password" &&
                            (showPassword ? (
                              <EyeOffIcon className="fill-primary-inverted-50 hover:fill-primary-inverted" />
                            ) : (
                              <EyeIcon className="fill-primary-inverted-50 hover:fill-primary-inverted" />
                            ))
                          }
                          iconClick={() =>
                            item.name === "password" &&
                            setShowPassword(!showPassword)
                          }
                          errorText={errors[item?.name]}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={data?.remember as boolean}
                      onChange={handleInputChange as () => void}
                    />
                    <span className="text-sm text-primary-inverted-50 font-medium">
                      Remember me
                    </span>
                  </div>
                  <Link
                    to={"/forgot-password"}
                    className={`bg-clip-text text-transparent bg-accent-duo text-sm mr-2 hover:underline`}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Button
                  pattern="primary"
                  type="submit"
                  content="Login"
                  className="!text-base"
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="bg-clip-text text-transparent bg-silver-duo-gradient text-xs md:text-sm">
                  Don't have an account?
                </p>
                <Link
                  to={"/register"}
                  className={`bg-clip-text text-transparent bg-accent-duo hover:font-extrabold text-sm md:text-base`}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </form>
        {(showGradient as VerticalScrollType).bottom && <BottomGradient />}
      </div>
    </div>
  );
};

export default Login;
