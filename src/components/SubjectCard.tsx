import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface SubjectCardProps {
  id: string;
  name: string;
  description?: string;
  color?: string;
  iconUrl?: string;
}

export const SubjectCard = ({ id, name, description, color }: SubjectCardProps) => {
  return (
    <Link to={`/subject/${id}`}>
      <Card 
        className="h-full transition-all hover:shadow-hover cursor-pointer gradient-card border-2"
        style={{ borderColor: color || 'hsl(var(--primary))' }}
      >
        <CardHeader>
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
            style={{ background: color || 'hsl(var(--primary))' }}
          >
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl">{name}</CardTitle>
          {description && (
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div 
            className="h-1 rounded-full"
            style={{ background: color || 'hsl(var(--primary))' }}
          />
        </CardContent>
      </Card>
    </Link>
  );
};
