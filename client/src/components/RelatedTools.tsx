import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { getRelatedTools, iconMap, type ToolCategory } from "@/data/toolsData";

interface RelatedToolsProps {
  currentToolId: string;
  category: ToolCategory;
}

export function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  const relatedTools = getRelatedTools(currentToolId, category, 4);

  if (relatedTools.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-xl font-semibold mb-6 text-center" data-testid="text-related-tools-title">
        More Tools You Might Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedTools.map((tool) => {
          const IconComponent = iconMap[tool.icon];
          return (
            <Link key={tool.id} href={tool.path}>
              <Card 
                className="h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                data-testid={`card-related-tool-${tool.id}`}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  {IconComponent && (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <h3 className="font-medium text-sm">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
