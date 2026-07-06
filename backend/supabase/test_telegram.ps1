# supabase/test_telegram.ps1 - secret keys removed for security
# This script is retained for reference but no longer contains actual credentials.
# To use, set appropriate environment variables or secure secret storage.


$headers = @{
    apikey        = $env:SUPABASE_SERVICE_ROLE_KEY
    Authorization = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
}

# Test: read telegram_settings with service role key (bypasses RLS)
try {
    $result = Invoke-RestMethod -Uri 'https://nywpojhuxuansxuotuii.supabase.co/rest/v1/telegram_settings?select=*' -Method Get -Headers $headers
    Write-Host "SUCCESS - Current telegram_settings:"
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR reading telegram_settings: $($_.Exception.Message)"
}
