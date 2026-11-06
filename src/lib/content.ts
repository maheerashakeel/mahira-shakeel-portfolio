import { defaultContent } from '../data/content'

// All site text and project data lives in src/data/content.ts.
export const content = defaultContent
export const useContent = () => content

// frame decides where a project goes: websites on the pinned stage, phone apps in the Mobile apps row
export const webProjects = content.projects.filter(p => p.frame !== 'phone')
export const appProjects = content.projects.filter(p => p.frame === 'phone')
