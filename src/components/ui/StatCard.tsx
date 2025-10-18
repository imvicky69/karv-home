import { type IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  iconBgColor?: string;
}

const StatCard = ({ title, value, icon: Icon, iconBgColor = 'bg-primary' }: StatCardProps) => {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-md flex items-center hover:shadow-xl transition-all duration-200 hover:scale-105">
      <div className={`p-4 rounded-xl ${iconBgColor} shadow-sm`}>
        <Icon className="text-white" size={28} />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;