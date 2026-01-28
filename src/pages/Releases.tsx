import { Header } from '@/components/Header';
import { useVersion } from '@/hooks/useVersion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export const Releases = () => {
  const { releases } = useVersion();

  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 text-left">Release History</h1>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
            {releases.map((release, index) => {
              const releaseDate = new Date(release.date);
              const formattedDate = format(releaseDate, 'MMMM d, yyyy');
              const isLatest = index === 0;

              return (
                <Card key={release.version} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={isLatest ? 'default' : 'secondary'} className="text-sm">
                          v{release.version}
                        </Badge>
                        {isLatest && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Latest
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2 text-left">{release.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {release.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-start gap-2 text-gray-700">
                          <span className="text-lg">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Releases;
