import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('VULKAN app crashed:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="login-screen">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="confirm-icon" style={{ margin: '0 auto 18px' }}>
            <AlertOctagon size={24} />
          </div>
          <div className="login-logo">
            VUL<span>KAN</span>
          </div>
          <p className="login-sub">
            Algo salió mal. Ya lo registramos — intenta recargar la página.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={this.handleReload}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
}
