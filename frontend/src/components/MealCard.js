import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarDays, Clock, Coins } from 'lucide-react';

const MealCard = ({ meal, selection, onToggle, loading }) => {
  const isSkipped = selection?.status === 'skipped';
  
  return (
    <Card className={`w-full transition-all ${isSkipped ? 'opacity-75 bg-muted/50' : 'border-primary/20'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2 capitalize">
              {meal.type}
            </Badge>
            <CardTitle className="text-lg">
              {new Date(meal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 text-amber-600 font-medium">
            <Coins size={16} />
            <span>{meal.price}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Menu:</div>
          <ul className="list-disc list-inside text-sm font-medium">
            {meal.menu_items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t bg-muted/20 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Switch 
            id={`meal-${meal.id}`} 
            checked={!isSkipped}
            onCheckedChange={(checked) => onToggle(meal.id, checked ? 'attending' : 'skipped')}
            disabled={loading}
            data-testid={`meal-switch-${meal.id}`}
          />
          <Label htmlFor={`meal-${meal.id}`} className={isSkipped ? "text-muted-foreground" : "font-medium"}>
            {isSkipped ? "Skipped (+ Credits)" : "Attending"}
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MealCard;
