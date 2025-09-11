import { type IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  iconBgColor?: string;
}

const StatCard = ({ title, value, icon: Icon, iconBgColor = 'bg-primary' }: StatCardProps) => {
  return (
    <div className="bg-surface p-4 rounded-xl shadow-md flex items-center">
      <div className={`p-3 rounded-lg ${iconBgColor}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;