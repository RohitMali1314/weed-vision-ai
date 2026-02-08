import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FeedbackItem {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

const Admin = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFeedback = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
    } else {
      setFeedbackList(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Feedback Dashboard</h1>
          </div>
          <Button onClick={fetchFeedback} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{feedbackList.length}</div>
              <div className="text-muted-foreground">Total Submissions</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-accent">
                {feedbackList.filter(f => f.type === 'suggestion').length}
              </div>
              <div className="text-muted-foreground">Suggestions</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-border">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground">
                {feedbackList.filter(f => f.type === 'feedback').length}
              </div>
              <div className="text-muted-foreground">Feedback</div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : feedbackList.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No feedback submissions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbackList.map((item) => (
              <Card key={item.id} className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === 'suggestion' ? (
                        <Lightbulb className="h-5 w-5 text-accent" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-primary" />
                      )}
                      <Badge variant={item.type === 'suggestion' ? 'secondary' : 'default'}>
                        {item.type}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
