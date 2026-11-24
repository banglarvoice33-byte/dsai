/*
 * DSAI harmless EICAR test-string detector for repeatable CI verification.
 */
rule DSAI_EICAR_Test_Signature
{
    meta:
        author = "DSAI Engineering"
        reference = "https://github.com/banglarvoice33-byte/dsai/tree/main/scanner-yara/rules/eicar_test.yar"
    strings:
        $eicar = "EICAR-STANDARD-ANTIVIRUS-TEST-FILE" ascii
    condition:
        $eicar
}
