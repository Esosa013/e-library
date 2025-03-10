import { Button } from '@/components/ui/button';

interface FilterSectionProps {
    title: string;
    options: (string | number)[];
    filterHandler: (filter: Record<string, string | number>) => void;
    titleClassName?: string;
    containerClassName?: string;
    buttonContainerClassName?: string;
    buttonClassName?: string;
    buttonVariant?: string;
    buttonSize?: string;
  }

const FilterSection:React.FC<FilterSectionProps> = ({ title, options, filterHandler }) => {
      return (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <Button
                key={option}
                variant="outline"
                size="sm"
                onClick={() => filterHandler({ [title.toLowerCase()]: option })}
                className="text-sm border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        );
      
}

export default FilterSection;