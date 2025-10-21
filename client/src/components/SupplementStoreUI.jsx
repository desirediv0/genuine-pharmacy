import React from "react";

import { card2, card3, card4 } from "@/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SupplementStoreUI = () => {
  const router = useRouter();

  const productCards = [
    {
      id: 1,
      image: card3,
      link: "/category/whey-protein",
    },
    {
      id: 2,
      image: card2,
      link: "/category/pre-workout",
    },
    {
      id: 3,
      image: card4,
      link: "/category/protein",
    },
  ];

  const handleCardClick = (link) => {
    router.push(link);
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white">
      {/* Product Cards Section */}
      <div className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {productCards.map((card) => (
              <div
                key={card.id}
                className="cursor-pointer transform  transition-all duration-300 overflow-hidden"
                onClick={() => handleCardClick(card.link)}
              >
                <Image
                  width={500}
                  height={500}
                  src={card.image}
                  alt="Product Promotion"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplementStoreUI;
