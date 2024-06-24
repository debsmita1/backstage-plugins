# ImportApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createImportJobs**](ImportApi.md#createImportJobs) | **POST** /imports | Submit Import Jobs |
| [**findAllImports**](ImportApi.md#findAllImports) | **GET** /imports | Fetch Import Jobs |


<a name="createImportJobs"></a>
# **createImportJobs**
> List createImportJobs(ImportRequest)

Submit Import Jobs

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ImportRequest** | [**List**](../Models/ImportRequest.md)| List of Import jobs to create | |

### Return type

[**List**](../Models/Import.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="findAllImports"></a>
# **findAllImports**
> List findAllImports(pagePerIntegration, sizePerIntegration)

Fetch Import Jobs

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **pagePerIntegration** | **Integer**| the page number for each Integration | [optional] [default to 1] |
| **sizePerIntegration** | **Integer**| the number of items per Integration to return per page | [optional] [default to 20] |

### Return type

[**List**](../Models/Import.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

