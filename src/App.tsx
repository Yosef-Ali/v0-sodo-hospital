import React, { ReactNode } from 'react';
import './App.css';

// UI Component Types
type CommonProps = {
  children: ReactNode;
  className?: string;
};

type ButtonProps = CommonProps & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  [key: string]: any;
};

type BadgeProps = CommonProps & {
  variant?: string;
};

type TabsProps = CommonProps & {
  defaultValue: string;
};

type TabsTriggerProps = CommonProps & {
  value: string;
};

type TabsContentProps = CommonProps & {
  value: string;
};

// UI Components
const Card = ({ children, className }: CommonProps) => <div className={`bg-white rounded-lg shadow ${className || ''}`}>{children}</div>;
const CardHeader = ({ children, className }: CommonProps) => <div className={`p-4 ${className || ''}`}>{children}</div>;
const CardContent = ({ children, className }: CommonProps) => <div className={`p-4 pt-0 ${className || ''}`}>{children}</div>;
const CardTitle = ({ children, className }: CommonProps) => <h3 className={`font-medium ${className || ''}`}>{children}</h3>;

const Button = ({ children, variant, size, className, ...props }: ButtonProps) => {
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent hover:bg-gray-100'
  };
  const sizeClasses = {
    default: 'py-2 px-4',
    sm: 'py-1 px-3 text-sm',
    icon: 'p-1'
  };
  return (
    <button 
      className={`rounded font-medium transition-colors ${variantClasses[variant || 'default']} ${sizeClasses[size || 'default']} ${className || ''}`} 
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <input className={`w-full px-3 py-2 border border-gray-300 rounded-md ${className || ''}`} {...props} />
);

const Table = ({ children, className }: CommonProps) => <table className={`w-full ${className || ''}`}>{children}</table>;
const TableHeader = ({ children }: { children: ReactNode }) => <thead>{children}</thead>;
const TableBody = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;
const TableRow = ({ children }: { children: ReactNode }) => <tr>{children}</tr>;
const TableHead = ({ children, className }: CommonProps) => <th className={`text-left p-2 ${className || ''}`}>{children}</th>;
const TableCell = ({ children, className }: CommonProps) => <td className={`p-2 ${className || ''}`}>{children}</td>;

const Tabs = ({ children, defaultValue }: TabsProps) => {
  return <div data-default-value={defaultValue}>{children}</div>;
};
const TabsList = ({ children, className }: CommonProps) => <div className={`flex ${className || ''}`}>{children}</div>;
const TabsTrigger = ({ children, value }: TabsTriggerProps) => (
  <button className="px-4 py-2 font-medium" data-value={value}>{children}</button>
);
const TabsContent = ({ children, value }: TabsContentProps) => <div data-value={value}>{children}</div>;

const Badge = ({ children, variant, className }: BadgeProps) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ''}`}>
    {children}
  </span>
);

const Avatar = ({ children }: { children: ReactNode }) => (
  <div className="w-8 h-8 rounded-full overflow-hidden">{children}</div>
);


function App() {
  // Sample avatar URLs
  const avatars = {
    bethel: 'https://randomuser.me/api/portraits/women/1.jpg',
    kakidan: 'https://randomuser.me/api/portraits/men/1.jpg',
    samuel: 'https://randomuser.me/api/portraits/men/2.jpg'
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <span className="mr-2">🏥</span>
          <h2 className="text-lg font-medium text-gray-800">Soddo Hospital</h2>
        </div>
        <div className="p-4 border-b border-gray-200">
          <Input type="text" placeholder="Search tasks, documents, and users..." />
        </div>
        <nav className="py-2">
          <ul>
            {[
              { icon: '📊', label: 'Dashboard', active: true },
              { icon: '✓', label: 'Tasks' },
              { icon: '📄', label: 'Documents' },
              { icon: '📅', label: 'Calendar' },
              { icon: '👥', label: 'Teams' },
              { icon: '📈', label: 'Reports' },
              { icon: '🏢', label: 'Departments' },
              { icon: '💬', label: 'Chat' },
              { icon: '❓', label: 'Help' },
              { icon: '⚙️', label: 'Settings' }
            ].map((item, index) => (
              <li key={index} className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${item.active ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Administrative Dashboard</h1>
          <p className="text-gray-600 text-sm">Track document processing and administrative tasks</p>
        </header>
        
        {/* Task Status Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-600">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="text-3xl font-bold text-gray-800">12</div>
              <div className="px-2 py-1 rounded text-sm bg-green-100 text-green-600">+2.5%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="text-3xl font-bold text-gray-800">24</div>
              <div className="px-2 py-1 rounded text-sm bg-green-100 text-green-600">+3.0%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="text-3xl font-bold text-gray-800">45</div>
              <div className="px-2 py-1 rounded text-sm bg-green-100 text-green-600">+2.5%</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Processing Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-xl">📄</span>
                <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-600">+12.5%</span>
              </div>
              <CardTitle className="text-base font-medium text-gray-600">Document Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 mb-1">156</div>
              <div className="text-gray-500 text-sm mb-4">Active documents</div>
              
              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>License Renewals</span>
                  <span>45%</span>
                </div>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Support Letters</span>
                  <span>35%</span>
                </div>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Authentication</span>
                  <span>20%</span>
                </div>
              </div>
              
              <div className="text-sm text-red-500 mb-4">24 documents need review</div>
              <Button variant="outline" className="w-full">View Details</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-xl">⏱️</span>
                <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-600">+2.3</span>
              </div>
              <CardTitle className="text-base font-medium text-gray-600">Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 mb-1">4.2</div>
              <div className="text-gray-500 text-sm mb-4">Processing duration</div>
              
              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>License Processing</span>
                  <span>3.5 days</span>
                </div>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Document Auth</span>
                  <span>4.8 days</span>
                </div>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Letter Generation</span>
                  <span>1.2 days</span>
                </div>
              </div>
              
              <div className="text-sm text-red-500 mb-4">8 tasks overdue</div>
              <Button variant="outline" className="w-full">View Details</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-xl">✓</span>
                <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-600">-4.5%</span>
              </div>
              <CardTitle className="text-base font-medium text-gray-600">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 mb-1">32</div>
              <div className="text-gray-500 text-sm mb-4">Awaiting review</div>
              
              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Ministry Of Labor</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>HERSA</span>
                  <span>8</span>
                </div>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Internal</span>
                  <span>12</span>
                </div>
              </div>
              
              <div className="text-sm text-red-500 mb-4">5 urgent approvals needed</div>
              <Button variant="outline" className="w-full">View Details</Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Task Controls */}
        <div className="flex justify-between items-center my-6">
          <Button variant="outline">Filter Tasks</Button>
          <Button>+ New Task</Button>
          <div className="w-64">
            <Input type="text" placeholder="Search tasks..." />
          </div>
        </div>
        
        {/* Task Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Document Processing Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">Document Processing Status</CardTitle>
              <p className="text-sm text-gray-500">45 documents in process</p>
            </div>
            <Button variant="outline" size="sm">Date Range</Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="authenticated">
              <TabsList className="mb-4">
                <TabsTrigger value="authenticated">Authenticated</TabsTrigger>
                <TabsTrigger value="under-review">Under Review</TabsTrigger>
                <TabsTrigger value="pending-submission">Pending Submission</TabsTrigger>
              </TabsList>
              <TabsContent value="authenticated">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <Avatar>
                          <img src={avatars.bethel} alt="Bethel Admin" />
                        </Avatar>
                        <span>Bethel Admin</span>
                      </TableCell>
                      <TableCell>submitted license renewal application</TableCell>
                      <TableCell>License Processing</TableCell>
                      <TableCell>2 minutes ago</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">pending</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">⋮</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <Avatar>
                          <img src={avatars.kakidan} alt="Kakidan" />
                        </Avatar>
                        <span>Kakidan</span>
                      </TableCell>
                      <TableCell>generated support letter</TableCell>
                      <TableCell>Document Processing</TableCell>
                      <TableCell>1 hour ago</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">completed</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">⋮</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <Avatar>
                          <img src={avatars.samuel} alt="Samuel" />
                        </Avatar>
                        <span>Samuel</span>
                      </TableCell>
                      <TableCell>uploaded authenticated documents</TableCell>
                      <TableCell>Document Authentication</TableCell>
                      <TableCell>3 hours ago</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">in-progress</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">⋮</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <span>Showing 1-10 of 45 tasks</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
