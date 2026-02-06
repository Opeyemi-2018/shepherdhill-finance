import React from "react";

interface HeaderContentProps {
  title?: string;
  subTitle?: string;
  description?: string;
  className?: string;
}

const HeaderContent: React.FC<HeaderContentProps> = ({
  title = "",
  subTitle = "",
  description = "",
  className = "",
}) => {
  return (
    <div className={`${className} `}>
      <div className="text-[22px] lg:text-[24px] flex items-center gap-2 font-medium">
        <h1 className="text-[#3A3A3A] dark:text-white">{title}</h1>
        {subTitle && (
          <span className="">{subTitle}</span>
        )}
      </div>
      {description && (
        <p className="text-[#979797] hidden lg:inline text-[14px]">
          {description}
        </p>
      )}
    </div>
  );
};

export default HeaderContent;
