import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-dark-card border-b-2 border-brand-gold shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
          <span className="text-brand-gold">Edu</span>Sphere
          <span className="text-lg sm:text-xl font-normal text-gray-300 block sm:inline sm:ms-2">
            Beta Version
          </span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
