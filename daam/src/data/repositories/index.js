// Единственная точка выбора источника данных. UI и сервисы импортируют только `repo`.
import { config } from '../../config/index.js';
import { mockRepository } from './mockRepository.js';
import { apiRepository } from './apiRepository.js';
export const repo = config.dataSource === 'api' ? apiRepository : mockRepository;
