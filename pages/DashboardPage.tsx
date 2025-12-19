
import React from 'react';
import { useData } from '../context/DataContext';
import { Users, Database, FileText, CheckCircle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
    <div className={`p-4 rounded-full ${color} flex-shrink-0`}>
      <Icon className="text-white" size={24} />
    </div>
    <div className="min-w-0">
      <p className="text-slate-500 text-sm font-medium truncate">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { clients, contracts, databases, contacts } = useData();

  const activeContracts = contracts.filter(c => c.its_active).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Рабочий стол</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Всего клиентов" 
          value={clients.length} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Договоры ИТС" 
          value={activeContracts} 
          icon={FileText} 
          color="bg-green-500" 
        />
        <StatCard 
          label="Баз на обслуживании" 
          value={databases.length} 
          icon={Database} 
          color="bg-purple-500" 
        />
        <StatCard 
          label="Контактные лица" 
          value={contacts.length} 
          icon={CheckCircle} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Новые клиенты</h3>
          <div className="space-y-3">
            {clients.slice(0, 5).map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="font-medium text-slate-800 truncate">{client.short_name}</div>
                  <div className="text-xs text-slate-500 truncate">{client.email}</div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex-shrink-0">
                  Активен
                </span>
              </div>
            ))}
            {clients.length === 0 && <p className="text-slate-400">Клиенты не найдены.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Истекающие договоры</h3>
          <div className="space-y-3">
            {contracts.slice(0, 5).map(contract => (
              <div key={contract.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="font-medium text-slate-800 truncate">{contract.contract_number}</div>
                  <div className="text-xs text-slate-500 truncate">До: {contract.end_date}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${contract.its_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {contract.its_active ? 'Активен' : 'Истек'}
                </span>
              </div>
            ))}
            {contracts.length === 0 && <p className="text-slate-400">Договоры не найдены.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
