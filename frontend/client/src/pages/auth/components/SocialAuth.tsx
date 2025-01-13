import { socialMediaAccounts } from "../register/constants";

const SocialAuth = () => {
  return (
    <div className="flex items-center justify-center gap-4">
      {socialMediaAccounts.map((item, index) => (
        <div
          key={index}
          className="h-12 w-12 p-2.5 rounded-2xl border border-primary-inverted-14 bg-seasalt-black backdrop-blur mb-2.5 shadow-neumorphic opacity-70 cursor-not-allowed pointer-events-none"
        >
          <img
            src={item.url}
            alt=""
            className="w-full h-full p-0.5 object-cover"
            title={item.name}
          />
        </div>
      ))}
    </div>
  );
};

export default SocialAuth;
