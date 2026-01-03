import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Key,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
  const { user, updateUser, changePassword, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasLetter: false,
    hasNumber: false
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validatePassword = (password) => {
    return {
      hasLength: password.length >= 6,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    };
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'newPassword') {
      setPasswordStrength(validatePassword(value));
    }
    
    // Limpar mensagens quando usuário começar a digitar
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Todos os campos de senha são obrigatórios');
      return;
    }

    if (!passwordStrength.hasLength || !passwordStrength.hasLetter || !passwordStrength.hasNumber) {
      setError('A nova senha deve ter pelo menos 6 caracteres, incluindo letras e números');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('A nova senha e confirmação não coincidem');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setError('A nova senha deve ser diferente da senha atual');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        setSuccess('Senha alterada com sucesso!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength({ hasLength: false, hasLetter: false, hasNumber: false });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro inesperado ao alterar senha');
      console.error('Erro ao alterar senha:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProfile = async () => {
    setLoading(true);
    try {
      await updateUser();
      setSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      setError('Erro ao atualizar perfil');
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const isPasswordValid = passwordStrength.hasLength && passwordStrength.hasLetter && passwordStrength.hasNumber;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
        </div>
        <Button onClick={handleRefreshProfile} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <User className="mr-2 h-4 w-4" />
          )}
          Atualizar Perfil
        </Button>
      </div>

      {(error || success) && (
        <Alert variant={error ? "destructive" : "default"}>
          <AlertDescription>{error || success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Perfil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Suas informações pessoais e de conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                    {getInitials(user?.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{user?.username}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant={isAdmin() ? "default" : "secondary"}>
                    {isAdmin() ? (
                      <>
                        <Shield className="mr-1 h-3 w-3" />
                        Administrador
                      </>
                    ) : (
                      <>
                        <User className="mr-1 h-3 w-3" />
                        Usuário
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Nome de Usuário
                  </Label>
                  <Input value={user?.username || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Label>
                  <Input value={user?.email || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Membro desde
                  </Label>
                  <Input 
                    value={user?.created_at ? formatDate(user.created_at) : ''} 
                    disabled 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Último Login
                  </Label>
                  <Input 
                    value={user?.last_login ? formatDate(user.last_login) : 'Nunca'} 
                    disabled 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="Digite sua senha atual"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Digite sua nova senha"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Indicadores de força da senha */}
                  {passwordData.newPassword && (
                    <div className="space-y-1 text-sm">
                      <div className={`flex items-center gap-2 ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-300'}`} />
                        Pelo menos 6 caracteres
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasLetter ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordStrength.hasLetter ? 'text-green-600' : 'text-gray-300'}`} />
                        Pelo menos uma letra
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />
                        Pelo menos um número
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Confirme sua nova senha"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !isPasswordValid}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Alterando senha...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas do Usuário */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suas Estatísticas</CardTitle>
              <CardDescription>
                Resumo da sua atividade no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user?.total_reports || 0}
                </div>
                <p className="text-sm text-muted-foreground">Relatórios Criados</p>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {user?.total_test_cases || 0}
                </div>
                <p className="text-sm text-muted-foreground">Casos de Teste</p>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {user?.files_uploaded || 0}
                </div>
                <p className="text-sm text-muted-foreground">Arquivos Enviados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notificações por Email</span>
                <Badge variant="outline">Em breve</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tema Escuro</span>
                <Badge variant="outline">Em breve</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Exportação Automática</span>
                <Badge variant="outline">Em breve</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

