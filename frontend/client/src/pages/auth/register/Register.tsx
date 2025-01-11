import AuthRobot from "../components/AuthRobot";

const Register = () => {
  return (
    <div className="w-full min-h-dvh p-4 flex gap-4 overflow-hidden">
      <AuthRobot />
      <div className="w-1/2 flex flex-col items-center justify-center gap-4 border border-[red]"></div>
    </div>
  );
};

export default Register;
