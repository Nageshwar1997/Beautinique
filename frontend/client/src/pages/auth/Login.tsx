import { RefObject, useState } from "react";
import { useForm, Controller, Control } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";

import AuthRobot from "./components/AuthRobot";
import TextDisplay from "../../components/TextDisplay";
import SocialAuth from "./components/SocialAuth";
import useVerticalScrollable from "../../hooks/useVerticalScrollable";
import { VerticalScrollType } from "../../types";
import Button from "../../components/button/Button";
import { BottomGradient, TopGradient } from "../../components/Gradients";
import { LoginTextContent } from "./constants";
import Checkbox from "../../components/input/Checkbox";
import Input from "../../components/input/Input";
import Radio from "../../components/input/Radio";

interface Test {
  loginMethod: "phoneNumber" | "email";
  email?: string;
  phoneNumber?: string;
  password: string;
  remember?: boolean;
}

// Validation Schema with Conditional Fields
const schema = yup.object().shape({
  loginMethod: yup.string().oneOf(["email", "phoneNumber"]).required(),
  email: yup.string().when("loginMethod", {
    is: "email",
    then: (schema) =>
      schema.email("Invalid email format").required("Email is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  phoneNumber: yup.string().when("loginMethod", {
    is: "phoneNumber",
    then: (schema) =>
      schema
        .matches(/^\d{10}$/, "Phone number must be 10 digits")
        .required("Phone number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required(),
  remember: yup.boolean(),
});

const LoginInput = ({
  name,
  type,
  placeholder,
  control,
  error,
}: {
  name: string;
  type: string;
  placeholder: string;
  control: Control<Test>;
  error: string;
}) => (
  <div>
    <Controller
      name={name as keyof Test}
      control={control}
      render={({ field }) => (
        <Input
          register={field} // Controller से आए हुए props
          name={name} // name को pass करना
          type={type} // type को pass करना
          placeholder={placeholder} // placeholder को pass करना
          errorText={error} // Error message pass करना
        />
      )}
    />
  </div>
);

const Login = () => {
  const [showGradient, containerRef] = useVerticalScrollable();
  const [loginMethod, setLoginMethod] = useState<"email" | "phoneNumber">(
    "email"
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      loginMethod: loginMethod,
      email: "",
      phoneNumber: "",
      password: "",
      remember: false, // ✅ Default value set to false
    },
  });

  const selectedMethod = watch("loginMethod");

  const handleLoginMethodChange = (method: "email" | "phoneNumber") => {
    setLoginMethod(method);
    setValue("loginMethod", method);
    setValue("email", method === "email" ? "" : undefined);
    setValue("phoneNumber", method === "phoneNumber" ? "" : undefined);
  };

  const onSubmit = (data: Test) => {
    const cleanedData = {
      ...Object.fromEntries(
        Object.entries(data).filter(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([_, value]) => value !== "" && value !== undefined
        )
      ),
      remember: data.remember ?? false,
    };

    console.log("Login data submitted:", cleanedData);
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
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
          className="w-full flex flex-col gap-4"
        >
          <TextDisplay
            content={LoginTextContent}
            contentClassName="mb-3 font-semibold"
          />
          <SocialAuth />
          <div className="flex gap-4">
            <Controller
              name="loginMethod"
              control={control}
              render={({ field }) => (
                <Radio
                  value={field.value}
                  onChange={(value) => {
                    // Trigger the custom method change function
                    handleLoginMethodChange(value as "email" | "phoneNumber");
                    field.onChange(value); // Make sure to call the field onChange
                  }}
                  options={[
                    { label: "Email", value: "email" },
                    { label: "Phone", value: "phoneNumber" },
                  ]}
                />
              )}
            />
          </div>

          <div className="w-full max-w-[400px] lg:max-w-[500px] sm:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
            <div className="shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col gap-5 lg:gap-6">
                <div className="flex flex-col gap-3 w-full">
                  {selectedMethod === "email" && (
                    <LoginInput
                      name="email"
                      type="text"
                      placeholder="Email"
                      control={control}
                      error={errors.email?.message as string}
                    />
                  )}
                  {selectedMethod === "phoneNumber" && (
                    <LoginInput
                      name="phoneNumber"
                      type="text"
                      placeholder="Phone Number"
                      control={control}
                      error={errors.phoneNumber?.message as string}
                    />
                  )}
                  <LoginInput
                    name="password"
                    type="password"
                    placeholder="Password"
                    control={control}
                    error={errors.password?.message as string}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Controller
                      name="remember"
                      control={control}
                      render={({ field }) => <Checkbox register={field} />}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-primary-inverted-50 font-medium"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to={"/forgot-password"}
                    className="bg-clip-text text-transparent bg-accent-duo text-sm mr-2 hover:underline"
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
                  className="bg-clip-text text-transparent bg-accent-duo hover:font-extrabold text-sm md:text-base"
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
