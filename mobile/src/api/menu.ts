import { apiGet } from './client';
import type { MenuData } from '../types';

export const fetchMenu = () => apiGet<MenuData>('menu');
