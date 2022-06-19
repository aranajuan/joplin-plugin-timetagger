import joplin from 'api';
import { Path } from 'api/types';

export namespace helpers {

		export async function getNoteParents(parent_id: string): Promise<any[]> {
		    const parents: any[] = new Array();
		    let last_id: string = parent_id;

		    while (last_id) {
		      const parent: any = await joplin.data.get(['folders', last_id], { fields: ['id', 'title', 'parent_id'] });
		      if (!parent) break;
		      last_id = parent.parent_id;
		      parents.push(parent);
		    }
		    return parents;
		}


		export async function getAll(path: Path, query: any): Promise<any[]> {
		    query.page = 1;
		    let response = await joplin.data.get(path, query);
		    let result = !!response.items ? response.items : [];
		    while (!!response.has_more) {
		      query.page += 1;
		      response = await joplin.data.get(path, query);
		      result.concat(response.items)
		    }
		    // console.log(`result: ${JSON.stringify(result)}`);
		    return result;
		}
}