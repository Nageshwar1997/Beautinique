import { useEffect, useMemo, useState } from "react";

const LoadingScreen = () => {
  const beautyFacts = useMemo(
    () => [
      `The term <span class=loadingHighlight>"Clean Beauty"</span> refers to skincare and makeup products made without harmful chemicals and toxins.`,
      `In <span class=loadingHighlight>"1915"</span>, Maurice Levy invented the first <span class=loadingHighlight>"twist-up lipstick"</span>, revolutionizing the beauty industry.`,
      `The first-ever commercial mascara, <span class=loadingHighlight>"Maybelline Cake Mascara"</span>, was introduced in <span class=loadingHighlight>"1917"</span>.`,
      `<span class=loadingHighlight>BB Cream (2011)</span> became a global sensation by combining skincare and foundation into one product.`,
      `The first <span class=loadingHighlight>cruelty-free certification</span> was introduced in <span class=loadingHighlight>"1996"</span> to support ethical beauty practices.`,
      `<span class=loadingHighlight>Vegan beauty</span> is on the rise, with brands formulating products without any animal-derived ingredients.`,
      `Dermatologists recommend <span class=loadingHighlight>SPF 30+</span> for daily sun protection to prevent premature aging and skin damage.`,
      `<span class=loadingHighlight>Serums</span> contain concentrated active ingredients that penetrate deeper into the skin for enhanced benefits.`,
      `<span class=loadingHighlight>Micellar Water</span> is a gentle yet effective way to cleanse the skin without rinsing, perfect for all skin types.`,
      `The world's first <span class=loadingHighlight>organic beauty brand</span> was founded in <span class=loadingHighlight>1978</span>, paving the way for natural cosmetics.`,
      `Some beauty brands use <span class=loadingHighlight>AI-powered tools</span> to personalize skincare recommendations based on user preferences.`,
      `<span class=loadingHighlight>Hyaluronic Acid</span> is a powerful hydrating ingredient that can hold up to 1,000 times its weight in water.`,
      `<span class=loadingHighlight>Retinol</span> is a dermatologist-approved ingredient known for reducing fine lines and improving skin texture.`,
      `<span class=loadingHighlight>Green Beauty</span> focuses on sustainable packaging and eco-friendly formulations to reduce environmental impact.`,
      `<span class=loadingHighlight>Sheet masks</span> originated in Indian and have become a staple in self-care and skincare routines worldwide.`,
      `The global <span class=loadingHighlight>cosmetic industry</span> is expected to reach <span class=loadingHighlight>$500 billion</span> by <span class=loadingHighlight>2026</span>.`,
      `The first-ever <span class=loadingHighlight>waterproof mascara</span> was developed in <span class=loadingHighlight>1938</span> and changed the beauty game.`,
      `The first <span class=loadingHighlight>liquid foundation</span> was launched in the <span class=loadingHighlight>1950s</span>, offering a more natural finish.`,
      `The term "glass skin" was popularized by <span class=loadingHighlight>Indian beauty</span> trends, emphasizing dewy, radiant skin.`,
      `The first commercial <span class=loadingHighlight>lip gloss</span> was introduced by Max Factor in <span class=loadingHighlight>1930</span>.`,
      `In the early <span class=loadingHighlight>2000s</span>, mineral makeup became a sought-after trend for its natural ingredients and skin benefits.`,
      `The <span class=loadingHighlight>Beauty Blender,</span> launched in <span class=loadingHighlight>2007</span>, transformed the way people applied foundation.`,
      `<span class=loadingHighlight>Facial oils</span> have gained popularity for their nourishing and hydrating properties, even for oily skin types.`,
      `Some brands are experimenting with <span class=loadingHighlight>AI makeup try-ons</span> to help users choose the perfect shade before purchasing.`,
      `The concept of a <span class=loadingHighlight>beauty subscription box</span> allows customers to try new products every month.`,
      `Some experts believe that <span class=loadingHighlight>customized skincare</span> could be the future of the beauty industry.`,
      "Others caution about potential risks of certain <span class=loadingHighlight>skincare ingredients,</span> such as parabens and sulfates.",
      `The development of <span class=loadingHighlight>sustainable beauty</span> aims to reduce plastic waste and promote ethical sourcing.`,
      `Despite trends, timeless beauty practices like <span class=loadingHighlight>hydration</span> and <span class=loadingHighlight>healthy eating</span> remain essential for glowing skin.`,
      `The first known use of the term <span class=loadingHighlight>"cosmeceuticals"</span> was in <span class=loadingHighlight>1984</span> to describe skincare products with medical benefits.`,
      `<span class=loadingHighlight>Fermented skincare</span> is gaining popularity for its probiotic benefits that improve skin health.`,
      `<span class=loadingHighlight>Beauty influencers</span> have a huge impact on the cosmetic industry, shaping trends and product demands.`,
      "<span class=loadingHighlight>AR beauty</span> apps are helping customers try on makeup virtually before making a purchase.",
      `The concept of <span class=loadingHighlight>smart skincare devices</span> is transforming beauty routines with AI-powered technology.`,
      "Some companies are developing <span class=loadingHighlight>biodegradable glitter</span> to make beauty more sustainable.",
      `The future of <span class=loadingHighlight>clean beauty</span> is focused on transparency, sustainability, and effective formulations.`,
      `The first <span class=loadingHighlight>fragrance-free makeup line</span> was launched in <span class=loadingHighlight>1980</span> to cater to sensitive skin.`,
      `The term <span class=loadingHighlight>dermocosmetics</span> is used for products that bridge the gap between skincare and dermatology.`,
      `The rise of <span class=loadingHighlight>gender-neutral beauty</span> is redefining the industry with inclusive products for all.`,
      ` <span class=loadingHighlight>Biodegradable packaging</span> is becoming more common in the beauty industry to reduce waste.`,
      ` <span class=loadingHighlight>Refillable makeup</span> is a growing trend that allows users to reuse packaging and minimize waste.`,
      `The first commercial <span class=loadingHighlight>nail polish</span> was inspired by automobile paint and introduced in <span class=loadingHighlight>1932</span>.`,
      ` The term <span class=loadingHighlight>"blue beauty"</span> refers to eco-conscious products designed to protect ocean ecosystems.`,
      ` <span class=loadingHighlight>Glass packaging</span> is being used more in luxury beauty to reduce plastic waste and enhance sustainability.`,
    ],
    []
  );
  const TEXT_CHANGE_INTERVAL = 4000;

  const [loadingState, setLoadingState] = useState({
    loadingProgress: 0,
    loadingText: beautyFacts[getRandomIndex(beautyFacts)],
  });
  useEffect(() => {
    const textIntervalId = setInterval(() => {
      const getRandomFactIndex = getRandomIndex(beautyFacts);
      setLoadingState((prevState) => ({
        ...prevState,
        loadingText: beautyFacts[getRandomFactIndex],
      }));
    }, TEXT_CHANGE_INTERVAL);

    return () => clearInterval(textIntervalId);
  }, [beautyFacts]);

  const loadingText = useMemo(
    () => (
      <p
        dangerouslySetInnerHTML={{ __html: loadingState.loadingText }}
        className="absolute top-[320px] bg-primary-50 border border-white/60 p-2 rounded-xl text-white/80 font-light md:font-normal mt-5 text-sm md:text-lg leading-6 md:leading-6 text-center"
      />
    ),
    [loadingState.loadingText]
  );
  function getRandomIndex(array: string[]) {
    return Math.floor(Math.random() * array.length);
  }
  return (
    <div
      className="h-screen flex flex-col items-center justify-center relative"
      style={{ background: "radial-gradient(#292828 5%, black 95%)" }}
    >
      <div className="relative flex flex-col justify-center items-center w-[90%] sm:w-[80%] md:w-[80%] lg:w-[60%]">
        <video
          src="https://ctruhcdn.azureedge.net/main-webiste/public/video/home/loading-video-optimize.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-[400px] h-[400px] mix-blend-lighten"
        />
        {loadingText}
      </div>
    </div>
  );
};
export default LoadingScreen;
