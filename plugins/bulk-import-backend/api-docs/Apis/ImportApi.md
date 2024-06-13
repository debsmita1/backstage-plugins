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
> List findAllImports()

Fetch Import Jobs

### Parameters
This endpoint does not need any parameter.

### Return type

[**List**](../Models/Import.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

