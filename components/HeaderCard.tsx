import { ReactNode } from "react";
import { IconType } from "react-icons";

interface StatCardProps {
  icon?: IconType;
  label?: string;
  value?: ReactNode;
  iconColor?: string;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconColor = "#FAB435",
}: StatCardProps) => {
  return (
    <div className="flex gap-2 items-center flex-1 bg-primary-foreground shadow-lg p-3 rounded-lg">
      {Icon ? (
        <Icon
          className="bg-white dark:bg-transparent  rounded-full p-2 w-12 h-12"
          style={{ color: iconColor }}
        />
      ) : null}
      <div>
        <p className="text-[14px] text-[#979797] text-nowrap">{label}</p>
        <h2 className="text-[16px] whitespace-nowrap lg:font-bold text-[#3A3A3A] dark:text-[#979797]">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h2>
      </div>
    </div>
  );
};

export default StatCard;
