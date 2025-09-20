import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatentCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

const PatentCard = ({ title, description, onClick }: PatentCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </CardContent>
    </Card>
  );
};

export default PatentCard;
