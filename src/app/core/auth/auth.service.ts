//=================[Auth Service y Roles]=========
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type RoleName = 'admin' | 'dev' | 'trainer' | 'mantenimiento' | 'produccion' | 'calidad' | 'employee' | 'disabled';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  number_employee?: string;
  role?: { id: number; name: RoleName } | null;
}

export interface Capabilities {
  isAdmin?: boolean;
  isTrainer?: boolean;
  canApprove?: boolean;
  approveRoles?: RoleName[];
  canCreateCert?: boolean;
  canExport?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiBase;

  private readonly _token = signal<string | null>(localStorage.getItem('auth_token'));
  private readonly _user = signal<AuthUser | null>(this.readJSON<AuthUser>('auth_user'));
  private readonly _capabilities = signal<Capabilities | null>(this.readJSON<Capabilities>('auth_capabilities'));
  private readonly _modules = signal<string[]>(this.readJSON<string[]>('auth_modules') || []);

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly capabilities = computed(() => this._capabilities());
  readonly modules = computed(() => this._modules());
  readonly isAuthenticated = computed(() => !!this._token());

  constructor(private http: HttpClient) {}

  //=================[Helpers almacenamiento]=========
  private writeJSON(key: string, value: any) {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  private readJSON<T>(key: string): T | null {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : null; } catch { return null; }
  }

  //=================[API]=========
  // Login flexible: si el identificador contiene '@' usa email; de lo contrario usa number_employee
  login(identifier: string, password: string) {
    const isEmail = /@/.test(identifier);
    const body = isEmail ? { email: identifier, password } : { number_employee: identifier, password };
    return this.http.post<any>(`${this.base}/login`, body);
  }

  getUser() {
    return this.http.get<any>(`${this.base}/user`);
  }

  //=================[Session]=========
  startSession(data: { token: string; user: AuthUser; capabilities?: Capabilities; modules?: string[] }) {
    const { token, user, capabilities, modules } = data;
    localStorage.setItem('auth_token', token);
    this._token.set(token);

    this.writeJSON('auth_user', user);
    this._user.set(user);

    this.writeJSON('auth_capabilities', capabilities || null);
    this._capabilities.set(capabilities || null);

    this.writeJSON('auth_modules', modules || []);
    this._modules.set(modules || []);
  }

  clearSession() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_capabilities');
    localStorage.removeItem('auth_modules');
    this._token.set(null);
    this._user.set(null);
    this._capabilities.set(null);
    this._modules.set([]);
  }

  //=================[Auth utils]=========
  hasModule(moduleName: string): boolean {
    return this._modules().includes(moduleName);
  }
  hasCapability<K extends keyof Capabilities>(cap: K): boolean {
    const c = this._capabilities();
    return !!(c && !!c[cap]);
  }
  isRoleOneOf(roles: RoleName[]): boolean {
    const r = this._user()?.role?.name as RoleName | undefined;
    return !!(r && roles.includes(r));
  }
}
