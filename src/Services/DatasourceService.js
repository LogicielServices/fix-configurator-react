import _ from 'lodash'
import CustomStore from 'devextreme/data/custom_store'
import DataSource from 'devextreme/data/data_source'
import { createStore } from 'devextreme-aspnet-data-nojquery'
import { getApiUrl } from '../utils/helper'
import { remove } from './ApiService'

let error = {
  status: undefined,
  statusText: '',
}

export const getRemoteDataSource = (props) => {
  const apiUrl = getApiUrl()
  return new CustomStore({
    key: props.key,
    async load(loadOptions) {
      if (props.filter) {
        loadOptions.filter = props.filter
      }
      if (props.customFilter) {
        loadOptions.filter = loadOptions.filter
          ? [loadOptions.filter, 'and', props.customFilter]
          : props.customFilter
      }
      if (props.defaultSort) {
        loadOptions.defaultSort = props.defaultSort
      }
      let params = '?'
      if (props.paramsInUrl) {
        params = '&'
      }
      ;[
        'skip',
        'take',
        'requireTotalCount',
        'requireGroupCount',
        'sort',
        'filter',
        'totalSummary',
        'group',
        'groupSummary',
        'defaultSort',
      ].forEach((i) => {
        if (i in loadOptions) {
          if (loadOptions?.[i]) {
            if (props?.isPageSize && i === 'take') {
              params += `pageSize=${JSON.stringify(loadOptions[i])}&`
            } else {
              params += `${i}=${JSON.stringify(loadOptions[i])}&`
            }
          }
        }
      })
      params = params.slice(0, -1)
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
      return fetch(`${apiUrl}${props.url}${params}`, {
        headers,
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          if (props.modifier) {
            props.modifier(data)
          }
          return {
            data: data?.data ?? [],
            totalCount: data?.totalCount ?? 0,
            summary: data?.summary ?? null,
            groupCount: data?.groupCount ?? 0,
          }
        })
        .catch(() => {
          return {
            data: [],
            totalCount: 0,
            summary: null,
            groupCount: 0,
          }
        })
    },
    remove: async (key) => {
      const res = await remove(`${props.url}?id=${key}`)
      return res
    },
  })
}

export const getRemoteDataSourceForFixMessages = (props) => {
  const apiUrl = getApiUrl();
  return new CustomStore({
    key: props.key,
    async load(loadOptions) {
      console.log('loadOptions', loadOptions);
      if (props.filter) {
        loadOptions.filter = props.filter;
      }
      if (props.customFilter) {
        loadOptions.filter = loadOptions.filter
          ? [loadOptions.filter, 'and', props.customFilter]
          : props.customFilter;
      }
      if (loadOptions?.filter?.[0] === 'messageType') {
        loadOptions.messageTypes = `${loadOptions?.filter?.[2]}`;
        loadOptions.messageTypeFilterMode = 'INCLUDE';
        loadOptions.hasFilterChanged = true;
      } else if (loadOptions?.filter?.[0]?.[0] === 'messageType') {
        loadOptions.messageTypeFilterMode = 'INCLUDE';
        loadOptions.hasFilterChanged = true;
        loadOptions?.filter?.forEach?.((filter) => {
          if (filter?.[0] === 'messageType') {
            console.log(filter?.[2]);
            if (!loadOptions.messageTypes) {
              loadOptions.messageTypes = `${filter?.[2]}`;
            } else {
              loadOptions.messageTypes = `${loadOptions.messageTypes},${filter?.[2]}`;
            }
          }
        });
      }
      if (props.defaultSort) {
        loadOptions.defaultSort = props.defaultSort;
      }
      let params = '?';
      if (props.paramsInUrl) {
        params = '&';
      }
      ;[
        'skip',
        'take',
        'requireTotalCount',
        'requireGroupCount',
        'sort',
        'filter',
        'totalSummary',
        'group',
        'groupSummary',
        'defaultSort',
        'messageTypes',
        'messageTypeFilterMode',
        'hasFilterChanged',
      ].forEach((i) => {
        if (i in loadOptions) {
          if (loadOptions?.[i]) {
            if (props?.isPageSize && i === 'take') {
              params += `pageSize=${JSON.stringify(loadOptions[i])}&`;
            } else if (typeof loadOptions[i] === 'string') {
              params += `${i}=${loadOptions[i]}&`;
            } else {
              params += `${i}=${JSON.stringify(loadOptions[i])}&`;
            }
          }
        }
      })
      params = params.slice(0, -1);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      };
      return fetch(`${apiUrl}${props.url}${params}`, {
        headers,
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          if (props.modifier) {
            props.modifier(data)
          }
          return {
            data: data?.data ?? [],
            totalCount: data?.totalCount ?? 0,
            summary: data?.summary ?? null,
            groupCount: data?.groupCount ?? 0,
          }
        })
        .catch(() => {
          return {
            data: [],
            totalCount: 0,
            summary: null,
            groupCount: 0,
          }
        });
    },
    remove: async (key) => {
      const res = await remove(`${props.url}?id=${key}`)
      return res
    },
  })
}

export const lookupRemote = (props, isGet = true) => {
  const apiUrl = getApiUrl()
  const lookupDataSource = {
    key: 'ID',
    paginate: true,
    group: props.group ?? null,
    store: new CustomStore({
      load: async (loadOptions) => {
        if (!loadOptions.take) {
          return {}
        }
        if (props.filter) {
          loadOptions.filter = props.filter
        }
        if (props.defaultSort) {
          loadOptions.defaultSort = props.defaultSort
        }
        if (props.sort) {
          loadOptions.sort = props.sort
        }
        if (
          loadOptions.searchExpr &&
          loadOptions.searchOperation &&
          loadOptions.searchValue
        ) {
          if (loadOptions.filter?.length) {
            loadOptions.filter = [
              loadOptions.filter,
              'and',
              [
                loadOptions.searchExpr,
                loadOptions.searchOperation,
                loadOptions.searchValue,
              ],
            ]
          } else {
            loadOptions.filter = [
              loadOptions.searchExpr,
              loadOptions.searchOperation,
              loadOptions.searchValue,
            ]
          }
        }
        let params = ''
        if (!props.url?.includes('?')) {
          params = '?'
        }
        ;[
          'skip',
          'take',
          'requireTotalCount',
          'requireGroupCount',
          'sort',
          'filter',
          'totalSummary',
          'group',
          'groupSummary',
          'defaultSort',
          // "searchExpr",
          // "searchOperation",
          // "searchValue",
        ].forEach((i) => {
          if (i in loadOptions) {
            if (loadOptions[i]) {
              params += `${i}=${JSON.stringify(loadOptions[i])}&`
            }
          }
        })
        const getParams = params.slice(0, -1)
        params = params.slice(1, -1)
        delete loadOptions.userData
        delete loadOptions.parentIds
        const body = JSON.stringify({ loadOptions })
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
        const request = isGet
          ? {
              method: 'GET',
              headers,
            }
          : {
              method: 'POST',
              body,
              headers,
            }
        const requestUrl = isGet ? `${props.url}${getParams}` : `${props.url}`
        try {
          const response = await fetch(`${apiUrl}${requestUrl}`, request)
          const data = await response.json()
          if (props.modifier) {
            props.modifier(data)
          }
          return {
            data: data?.data ?? [],
            totalCount: data?.totalCount ?? 0,
            summary: data?.summary ?? null,
            groupCount: data?.groupCount ?? 0,
          }
        } catch {
          return {
            data: [],
            totalCount: 0,
            summary: null,
            groupCount: 0,
          }
        }
      },
      insert: () => {},
      byKey: () => {
        // return fetch(`${props.url}?id=${key}`).then(handleErrors);
      },
    }),
  }
  return lookupDataSource
}

export const CustomLookup = (props) => {
  const apiUrl = getApiUrl()
  const url = `${apiUrl}${props.url}`
  return new DataSource({
    store: createStore({
      key: props.key || 'id',
      insertUrl: url,
      loadUrl: url,
      loadMethod: props.method ?? 'GET',
      onBeforeSend: (method, ajaxOptions) => {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
        ajaxOptions.headers = headers
        if (props.method ?? 'GET' === 'POST') {
          ajaxOptions.dataType = 'json'
          if (ajaxOptions.data?.filter) {
            const filter = JSON.parse(ajaxOptions.data.filter || '[]')
            ajaxOptions.data.filter = filter
          }
          if (props.sort) {
            ajaxOptions.data.sort = props.sort
          }

          if (
            ajaxOptions.data?.filter?.[0] &&
            ajaxOptions.data.filter[0][0] === null
          ) {
            ajaxOptions.data.filter[0][0] = props.searchKey ?? 'name'
          }
          // if (props.filter) {
          //   ajaxOptions.data.filter = [
          //     [...ajaxOptions.data.filter],
          //     'and',
          //     [...props.filter],
          //   ]
          // }
          if (_.isEmpty(props.payload)) {
            ajaxOptions.data = JSON.stringify({
              loadOptions: ajaxOptions.data,
            })
          } else {
            ajaxOptions.data = JSON.stringify({
              loadOptions: ajaxOptions.data,
              ...props.payload,
            })
          }
        }
      },
      onAjaxError: (e) => {
        error = {
          status: e.xhr.status,
          statusText: e.xhr.statusText,
        }
        e.error = error
        if (Object.prototype.hasOwnProperty.call(props, 'onAjaxError')) {
          props.onAjaxError(e)
        }
        return e
      },
      errorHandler: () => {
        if (Object.prototype.hasOwnProperty.call(props, 'errorHandler')) {
          props.errorHandler(error)
        }
        return error
      },
      async: true,
    }),
    paginate: props.paginate || true,
    pageSize: props.pageSize || 20,
    select: props.select,
    filter: props.filter,
    sort: props.sort,
    take: props.take,
    requireTotalCount: props.requireTotalCount || false,
    postProcess: (data) => {
      if (props?.modifier) {
        props.modifier(data ?? [])
      }
      return props.distinct
        ? [
            ...new Map(
              data.map((item) => [item[props.key || 'id'], item]),
            ).values(),
          ]
        : (data ?? [])
      // return props.distinct ? [...new Map(data.map((item) => [item[props.key || "id"], item])).values()] : data;
    },
    // key: props.key || ["id"],
  })
}

export const loadMoreData = async (store) => {
  if (typeof store?.isLastPage !== 'function') return
  const isLastPage = await store.isLastPage()
  const isLoading = await store.isLoading()
  const totalCount = await store.totalCount()
  const itemsCount = (await store.items()?.length) || 0
  if (totalCount === itemsCount) {
    return
  }
  if (!isLastPage && !isLoading) {
    const nextPage = store.pageIndex()
    store.pageIndex(nextPage + 1)
    store.load()
  }
}

export const getDataSourceWithCustomLoadOptions = (route) => {
  let arr = []
  const store = new DataSource({
    reshapeOnPush: true,
    store: createStore({
      key: 'ID',
      loadUrl: `${getApiUrl() + route}`,
      loadMethod: 'POST',
      onBeforeSend: (method, ajaxOptions) => {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
        ajaxOptions.headers = headers
        if (ajaxOptions.data?.filter) {
          const filter = JSON.parse(ajaxOptions.data.filter || '[]')
          ajaxOptions.data.filter = filter
        }
        if (ajaxOptions.data?.sort) {
          const sort = JSON.parse(ajaxOptions.data.sort || '[]')
          ajaxOptions.data.sort = sort
        }
        ajaxOptions.data = JSON.stringify({
          loadOptions: ajaxOptions.data,
        })
      },
    }),
    postProcess: (data) => {
      if (store.pageIndex() === 0) {
        arr = data
      } else {
        const newData = [...data]
        data.length = 0

        for (const item of arr) {
          data.push(item)
        }
        for (const item of newData) {
          data.push(item)
        }
        arr = data
      }
      return data ?? []
    },
    paginate: true,
    pageSize: 21,
    requireTotalCount: true,
    filter: undefined,
    sort: [{ selector: 'modified', desc: true }],
  })
  return store
}
