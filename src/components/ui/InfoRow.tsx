interface InfoRowProps {
  label: string;
  value: string | number | null;
}

const InfoRow = ({ label, value }: InfoRowProps) => {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200">
      <p className="text-text-secondary">{label}</p>
      <p className="font-semibold text-text-primary">{value || 'N/A'}</p>
    </div>
  );
};

export default InfoRow;